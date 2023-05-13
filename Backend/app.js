const utils = require("./src/utils");

require("dotenv").config();
var logger = require("morgan");
var express = require("express");
const cron = require("node-cron");
const axios = require("axios");

//Set up mongoose connection
const mongoose = require("mongoose");
const mongoDB =
  "mongodb+srv://" +
  process.env.DBUSERNAME +
  ":" +
  process.env.DBPASS +
  "@ib3.cz116sr.mongodb.net/IB3?retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var app = express();

// Use body-parser to parse incoming request bodies
app.use(express.json());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));

// Create indexes
db.collection("reservations").createIndex({ end: 1 });
db.collection("reservations").createIndex({ uid: 1 });
db.collection("pastReservations").createIndex({ uid: 1 });

// Schedule moveExpiredReservations to run every minute
cron.schedule("* * * * *", () => {
  utils.moveExpiredReservations(db);
});

/**
 * /giveLicensePlate
 *
 *  checks if the license plate given by HA is valid and opens the barrier if license plate is found and is within the time slot
 */
app.post("/giveLicensePlate", async function (req, res) {
  if (!utils.isBearerTokenValid(req, process.env.AUTH_TOKEN)) {
    res.status(401).send("Unauthorized: invalid authentication token");
    return;
  }

  const licenseplate = req.body.plate;
  const reservations = await db
    .collection("reservations")
    .find({ plate: licenseplate })
    .toArray();

  const now = new Date();
  for (reservation of reservations) {
    if (reservation.start <= now < reservation.end) {
      axios.request({
        method: "POST",
        maxBodyLength: Infinity,
        url: process.env.HA_ENTRY_POINT + "api/services/number/set_value",
        headers: {
          Authorization: "Bearer " + process.env.HA_BEARER_TOKEN,
          "Content-Type": "text/plain",
        },
        data: '{"entity_id": "number.ingang_garage_servo","value": 0}',
      });
      res.send("Opened barrier");
      return;
    }
  }
  res.status(404).send("404 Not Found: licenseplate not found");
});

/**
 * /getReservations
 *
 * returns all reservations for a certain user
 */
app.get("/getReservations", async function (req, res) {
  if (!utils.isBearerTokenValid(req, process.env.AUTH_TOKEN)) {
    res.status(401).send("Unauthorized: invalid authentication token");
    return;
  }

  const uid = req.headers["x-secure-string"];
  const reservations = await db
    .collection("reservations")
    .find({ uid: uid })
    .toArray();

  res.send(JSON.stringify(reservations));
});

/**
 * /getPastReservations
 *
 * returns all past reservations for a certain user
 */
app.get("/getPastReservations", async function (req, res) {
  if (!utils.isBearerTokenValid(req, process.env.AUTH_TOKEN)) {
    res.status(401).send("Unauthorized: invalid authentication token");
    return;
  }

  const uid = req.headers["x-secure-string"];
  const pastReservations = await db
    .collection("pastReservations")
    .find({ uid: uid })
    .toArray();

  res.send(JSON.stringify(pastReservations));
});

/**
 * /insertReservation
 *
 * inserts a reservation into the mongoDB
 */
app.post("/insertReservation", async function (req, res) {
  if (!utils.isBearerTokenValid(req, process.env.AUTH_TOKEN)) {
    res.status(401).send("Unauthorized: invalid authentication token");
    return;
  }

  const data = {
    plate: req.body.plate.toLowerCase(),
    start: new Date(req.body.start),
    end: new Date(req.body.end),
    disabled: req.body.disabled,
    uid: req.body.uid,
    price: undefined,
    parkingSlot: undefined,
  };

  // Check if data is valid
  // 420 is our custom error code
  if (data.plate === "") res.status(420).send("License plate may not be empty");
  else if (data.end <= data.start)
    res.status(420).send("End date must be after start date!");
  else if (data.start < new Date())
    res.status(420).send("Start time may not be in the past!");
  else {
    // Data is valid
    const slot = await utils.findParkingSlot(
      db,
      data.start,
      data.end,
      data.disabled
    );
    if (slot === -1) {
      res.status(420).send("All parking spots are full in this timeslot...");
      return;
    }
    data.parkingSlot = slot;
    const price = utils.calculatePrice(data.start, data.end);
    data.price = price;
    await db.collection("reservations").insertOne(data);
    res.send(
      `Your reservation was successful! \nYou can park in slot ${slot} during the provided timeslot. \nYou will have to pay €${price} when you leave the parking.`
    );
  }
});

module.exports = app;
