import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../shared/components/FormElements/Button";
import { useHttpClient } from "../../shared/hooks/http-hook";
import InputSlider from "./../../POI/slider";
import Select from "./../../POI/select";
import Box from "@mui/material/Box";
import "./PoiDetails.css";
import axios from "axios";
import Modal from "../../shared/components/UIElements/Modal";

function DetailsPoi() {
  const { sendRequest } = useHttpClient();
  const place = localStorage.getItem("places"); // here we get place
  const distance = localStorage.getItem("distance"); // here we get transport
  const transport = localStorage.getItem("transport"); // here we get transport, we need for routing
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRouting, setShowRouting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [datails, setDetails] = useState([]);
  const [route, setRoute] = useState();
  let origin;
  const address = useParams().address; // here we get coordinates

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=AIzaSyC17TTbMqVmSDt_5ZcZeGXoU1Y9CTx7at0`
      );
      const coordinates = response.data.results[0].geometry.location;
      origin = `${coordinates.lat},${coordinates.lng}`;
      localStorage.setItem("coordinates", origin);
    }
    fetchData();
  }, []);
  const exitHandler = () => {
    setShowConfirmModal(false);
  };

  const fetchPOI = async () => {
    const origin = localStorage.getItem("coordinates"); // here we get place
    try {
      const responseData = await sendRequest(
        `https://www.overpass-api.de/api/interpreter?data=[out:json];node[amenity=${place}](around:${distance},${origin});out%20meta;`
      );
      return responseData.elements.map((item) => {
        console.log(responseData);
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

  const showRoute = async (id, lat, lon) => {
    setShowConfirmModal(true);

    const origin = localStorage.getItem("coordinates"); // here we get place
    try {
      const BASE_URL = "https://api.distancematrix.ai";
      const TOKEN = "eiYGl6W4ug7GE82Ai6xnI04wzIXGK";

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
      console.log(responseData.rows[0].elements[0].distance.text);
      setRoute(responseData);
      setShowRouting(true);
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
        <Button danger type="button" onClick={fetchPOI}>
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
                    showRoute(element.id, element.lat, element.lon);
                  }}
                >
                  show route
                </button>
              </div>
            );
          })}
        {showRouting && (
          <>
            <Modal
              show={showConfirmModal}
              header="Your route!"
              footerClass="place-item__modal-actions"
              footer={
                <React.Fragment>
                  <Button danger onClick={exitHandler}>
                    Exit
                  </Button>
                </React.Fragment>
              }
            >
              Your target address is {route.destination_addresses}.
              <br />
              Your starting location is {route.origin_addresses}.
              <br />
              <br />
              The distance to the target is
              {route.rows[0].elements[0].distance.text}.
              <br />
              You will be there in {route.rows[0].elements[0].duration.text}.
            </Modal>
          </>
        )}
        ;
      </Box>
    </>
  );
}

export default DetailsPoi;
