const constants = require("./constants");

/**
 * calculatePrices
 *
 * returns the price for a reservation
 */
function calculatePrice(start, end) {
  if (end - start === 30 * 60 * 1000) return 0;
  else if (end - start >= 24 * 60 * 60 * 1000)
    return (
      Math.ceil((end - start) / (24 * 60 * 60 * 1000)) * constants.PRICES.day
    );
  else return ((end - start) / (60 * 60 * 1000)) * constants.PRICES.hour;
}

/**
 * findParkingSlot
 *
 *  returns a parkingSlot number based on the start and end date (and if it is a disabled parking space)
 */
async function findParkingSlot(db, start, end, disabled) {
  const possibilities = disabled
    ? constants.PARKING_SLOTS.disabled
    : constants.PARKING_SLOTS.normal;
  for (slot of possibilities) {
    var free = true;
    const reservations = await db
      .collection("reservations")
      .find({ parkingSlot: slot })
      .toArray();
    if (reservations) {
      for (reservation of reservations) {
        if (start < reservation.end && reservation.start < end) {
          // 1x overlap -> sws niet meer goed
          free = false;
          break;
        }
      }
      // Geen enkele keer overlap -> ook nog goed
      if (free) return slot;
    } else {
      // Geen reserveringen gevonden voor dit slot -> nog vrij dus
      return slot;
    }
  }
  // Niks gevonden dat past...
  return -1;
}

/**
 * moveExpiredReservations
 *
 * moves all reservations that are expired to the pastReservations collection (also after the server crashed)
 */
async function moveExpiredReservations(db) {
  try {
    const now = new Date();
    const expiredReservations = await db
      .collection("reservations")
      .find({ end: { $lte: now }, movedToPast: { $ne: true } })
      .toArray();
    if (expiredReservations.length > 0) {
      const expiredIds = expiredReservations.map(
        (reservation) => reservation._id
      );
      await db
        .collection("reservations")
        .updateMany(
          { _id: { $in: expiredIds } },
          { $set: { movedToPast: true } }
        );
      const expiredReservationsWithMovedToPast = expiredReservations.map(
        (reservation) => ({ ...reservation, movedToPast: true })
      );
      await db
        .collection("pastReservations")
        .insertMany(expiredReservationsWithMovedToPast);
      await db
        .collection("reservations")
        .deleteMany({ _id: { $in: expiredIds } });
      console.log(
        `[${new Date().toLocaleTimeString("be")}] Moved ${
          expiredReservations.length
        } expired reservations to pastReservations collection`
      );
    }
  } catch (error) {
    console.error("Error occurred in moveExpiredReservations function:", error);
  }
}

/**
 * isBearerTokenValid
 *
 * checks if a given bearer token from the req header is valid or not, returns the corresponding boolean
 */
function isBearerTokenValid(req, auth_token) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return false;
  }
  const authParts = authHeader.split(" ");
  if (authParts.length !== 2 || authParts[0] !== "Bearer") {
    return false;
  }
  const token = authParts[1];
  if (token !== auth_token) {
    return false;
  }
  return true;
}

module.exports = {
  calculatePrice,
  findParkingSlot,
  moveExpiredReservations,
  isBearerTokenValid,
};
