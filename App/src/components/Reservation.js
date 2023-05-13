import React from "react";

import Article from "./Article";

const Reservation = ({ data, past = false }) => {
  const start = new Date(data.start);
  const end = new Date(data.end);
  return (
    <Article
      title={data.plate}
      text={`Start: ${start.getDate()}/${
        start.getMonth() + 1
      }/${start.getFullYear()} at ${start.toLocaleTimeString()}\nEnd: ${end.getDate()}/${
        end.getMonth() + 1
      }/${end.getFullYear()} at ${end.toLocaleTimeString()}\nDisabled: ${
        data.disabled ? "Yes" : "No"
      }\nPrice: €${data.price}\nSlot: ${data.parkingSlot}`}
      red={!past}
    />
  );
};

export default Reservation;
