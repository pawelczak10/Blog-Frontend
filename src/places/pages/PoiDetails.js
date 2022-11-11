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
  const [test, setTest] = useState();
  let origin;
  const address = useParams().address; // here we get coordinates

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=TUTAJ WPISZ SWOJ KEY Z GOOGLE MAPS `
      );
      const coordinates = response.data.results[0].geometry.location;
      origin = `${coordinates.lat},${coordinates.lng}`;
      localStorage.setItem("coordinates", origin);
    }
    fetchData();
  }, []);
  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const fetchUsers = async () => {
    const origin = localStorage.getItem("coordinates"); // here we get place
    try {
      const responseData = await sendRequest(
        `https://www.overpass-api.de/api/interpreter?data=[out:json];node[amenity=${place}](around:${distance},${origin});out%20meta;`
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

  const showId = async (id, lat, lon) => {
    setShowConfirmModal(true);

    const origin = localStorage.getItem("coordinates"); // here we get place
    console.log(origin);
    console.log(id);
    console.log(lat);
    console.log(lon);
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
      setTest(responseData);
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
        {showRouting && (
          <>
            <Modal
              show={showConfirmModal}
              header="Your route!"
              footerClass="place-item__modal-actions"
              footer={
                <React.Fragment>
                  <Button danger onClick={cancelDeleteHandler}>
                    Exit
                    {console.log(test)}
                  </Button>
                </React.Fragment>
              }
            >
              Your target address is {test.destination_addresses}.
              <br />
              Your starting location is {test.origin_addresses}.
              <br />
              <br />
              The distance to the target is
              {test.rows[0].elements[0].distance.text}.
              <br />
              You will be there in {test.rows[0].elements[0].duration.text}.
            </Modal>
          </>
        )}
        ;
      </Box>
    </>
  );
}

export default DetailsPoi;
