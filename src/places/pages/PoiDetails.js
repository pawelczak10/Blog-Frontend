import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../shared/components/FormElements/Button";
import { useHttpClient } from "../../shared/hooks/http-hook";
import InputSlider from "./../../POI/slider";
import Select from "./../../POI/select";

import Box from "@mui/material/Box";
import "./PoiDetails.css";
function DetailsPoi() {
  const { sendRequest } = useHttpClient();
  const place = localStorage.getItem("places"); // here we get place
  const distance = localStorage.getItem("distance"); // here we get transport
  const address = useParams().address; // here we get coordinates
  const transport = localStorage.getItem("transport"); // here we get transport, we need for routing

  const [loadingData, setLoadingData] = useState(false);
  const [datails, setDetails] = useState([]);

  const fetchUsers = async () => {
    try {
      const responseData = await sendRequest(
        `https://www.overpass-api.de/api/interpreter?data=[out:json];node[amenity=${place}](around:${distance},51.066661, 17.013243);out%20meta;`
      );
      return responseData.elements.map((item) => {
        setDetails((current) => [
          ...current,
          { name: item.tags.name, id: item.id, lat: item.lat, lon: item.lon },
        ]);
        setLoadingData(true);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const showId = async (data, lat, lon) => {
    console.log(data);
    console.log(lat);
    console.log(lon);
    try {
      const BASE_URL = "https://api.distancematrix.ai";
      const TOKEN = "MJHOQrGL2S0cdvUqzOTZ1uwM1ygzO";

      const origin = "51.066661,17.013243";
      const traffic_model = "best_guess";
      const departure_time = "now";

      const responseData = await sendRequest(
        BASE_URL +
          "/maps/api/distancematrix/json" +
          `?key=${TOKEN}` +
          `&origins=${origin}` +
          `&destinations=${lat},${lon}` +
          `&mode=${transport}` +
          `&traffic_model=${traffic_model}` +
          `&departure_time=${departure_time}`
      );

      console.log(responseData);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection={"column"}
        maxWidth={400}
        alignItems="center"
        justifyContent={"center"}
        margin="auto"
        marginTop={25}
        padding={3}
        borderRadius={5}
        sx={{
          background: "white",
        }}
      >
        <InputSlider />
        <Select
          name="Type of transport"
          option={["driving", "walking", "bicycling"]}
        />
        <Select
          name="Type of places"
          option={["restaurant", "bar", "school", "fast_food", "bank"]}
        />

        <Button danger type="button" onClick={fetchUsers}>
          SHOW DETAILS
        </Button>
        {loadingData &&
          datails.map((element, index) => {
            return (
              <div key={index} className="content">
                <h2>{element.name}</h2>
                <button
                  className="buttons"
                  danger
                  type="button"
                  onClick={() => {
                    showId(element.id, element.lat, element.lon);
                  }}
                >
                  show route
                </button>
              </div>
            );
          })}
        {/* </div> */}
      </Box>
    </>
  );
}

export default DetailsPoi;
