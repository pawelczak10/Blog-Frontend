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
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import imga from "./arow.png";

function DetailsPoi() {
  const { sendRequest } = useHttpClient();
  const place = localStorage.getItem("places"); // here we get place
  const distance = localStorage.getItem("distance"); // here we get transport
  const transport = localStorage.getItem("transport"); // here we get transport, we need for routing
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRouting, setShowRouting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [locations, setLocations] = useState();
  const [mapka, setMapka] = useState();
  const [markerss, setMarkerss] = useState([]);
  const [datails, setDetails] = useState([]);
  const [route, setRoute] = useState();
  const [showRoutee, setShowRoutee] = useState(false);
  const [routeListUpdate, setrouteListUpdate] = useState(false);
  const address = useParams().address; // here we get coordinates

  var directionsDisplay;

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=AIzaSyDdMBjsYmBP6EKIxyu4jOXdrZvLYWT8-1s`
      );
      const coordinates = response.data.results[0].geometry.location;
      let origin = `${coordinates.lat},${coordinates.lng}`;
      localStorage.setItem("coordinates", origin);
    }
    fetchData();
  });
  const exitHandler = () => {
    setShowConfirmModal(false);
  };

  const fetchPOI = async () => {
    console.log("fetchPOI");
    const origin = localStorage.getItem("coordinates"); // here we get place
    try {
      setDetails([]);
      const responseData = await sendRequest(
        `https://www.overpass-api.de/api/interpreter?data=[out:json];node[amenity=${place}](around:${distance},${origin});out%20meta;`
      );

      console.log(responseData);
      setrouteListUpdate(false);
      responseData.elements.map((item) => {

        setDetails((current) => [
          ...current,
          { name: item.tags.name, id: item.id, lat: item.lat, lon: item.lon },
        ]);

        setLoadingData(true);

        const marker = new window.google.maps.Marker({
          position: { lat: item.lat, lng: item.lon },
          map: mapka,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          },
        });

        var infowindow = new window.google.maps.InfoWindow();
        window.google.maps.event.addListener(
          marker,
          "click",
          (function (marker) {
            return function () {
              infowindow.setContent(item.tags.name);
              infowindow.open(mapka, marker);
            };
          })(marker)
        );
        window.google.maps.event.addListener(
          marker,
          "dblclick",
          (function (marker) {
            return function () {

              setrouteListUpdate(true);
              infowindow.close(mapka, marker);
              locations.push({
                Name: item.tags.name,
                Lat: item.lat,
                Long: item.lon,
              });
              localStorage.setItem("coordinates", `${item.lat}, ${item.lon}`);
              printRoute(locations);
              setShowRoutee(true);
              setrouteListUpdate(true);
              for (var i = 0; i < markerss.length; i++) {
                markerss[i].setMap(null);
              }
              setMarkerss([]);
              setDetails([]);
            };
          })(marker)
        );
        markerss.push(marker);
      });
    } catch (err) {
      console.log(err);
    }
    setrouteListUpdate(true);
  };

  function printRoute() {
    var directionsService = new window.google.maps.DirectionsService();
    if (directionsDisplay != null) {
      directionsDisplay.setMap(null);
      directionsDisplay = null;
    }
    directionsDisplay = new window.google.maps.DirectionsRenderer({
      map: mapka,
      // suppressMarkers: true
      preserveViewport: true,
    });
    directionsDisplay.setMap(mapka);

    var request = {
      travelMode: window.google.maps.TravelMode.WALKING,
    };
    directionsDisplay.setDirections({ routes: [] });
    for (var i = 0; i < locations.length; i++) {
      if (i === 0)
        request.origin = { lat: locations[i].Lat, lng: locations[i].Long };
      else if (i === locations.length - 1)
        request.destination = { lat: locations[i].Lat, lng: locations[i].Long };
      else {
        if (!request.waypoints) request.waypoints = [];
        request.waypoints.push({
          location: { lat: locations[i].Lat, lng: locations[i].Long },
          stopover: true,
        });
      }
    }
    directionsService.route(request, function (result, status) {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(result);
      }
    });
  }

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
      //console.log(responseData.rows[0].elements[0].distance.text);
      setRoute(responseData);
      setShowRouting(true);
    } catch (err) {
      console.log(err);
    }
  };
  const [map, setMap] = useState(0);

  useEffect(() => {
    if (map !== 0) {
      const startPlace = localStorage.getItem("coordinates");
      var array = startPlace.split(",");

      const mapaaa = new window.google.maps.Map(map, {
        center: {
          lat: parseFloat(array[0], 10),
          lng: parseFloat(array[1], 10),
        },
        zoom: 16,
      });

      var initialMarker = new window.google.maps.Marker({

        position: {
          lat: parseFloat(array[0], 10),
          lng: parseFloat(array[1], 10),
        },
        map: mapaaa,
      });
      markerss.push(initialMarker);
      setMapka(mapaaa);
      const loc = [
        {
          Name: "Start",
          Lat: parseFloat(array[0], 10),
          Long: parseFloat(array[1], 10),
        },
      ];
      setLocations(loc);
    }
  }, [map]);

  function changeBackgroundYellow(e, element) {
    e.currentTarget.style.background = "yellow";

    markerss.forEach((i) => {
      if (
        i.getPosition().lat() === element.lat &&
        i.getPosition().lng() === element.lon
      )
        i.setIcon({
          url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
        });
    });
  }

  function changeBackgroundWhite(e, element) {
    e.currentTarget.style.background = "white";
    markerss.forEach((i) => {
      if (
        i.getPosition().lat() === element.lat &&
        i.getPosition().lng() === element.lon
      )
        i.setIcon({
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        });
    });
  }
  function onClickList(e, element) {
    console.log("You clicked me <3");
    var c = true;
    setrouteListUpdate(true);
    markerss.forEach((i) => {
      if (
        i.getPosition().lat() === element.lat &&
        i.getPosition().lng() === element.lon &&
        c
      ) {
        c = false;
        var latt = i.getPosition().lat();
        var lonn = i.getPosition().lng();

        locations.push({
          Name: element.name,
          Lat: latt,
          Long: lonn,
        });
        localStorage.setItem("coordinates", `${latt}, ${lonn}`);
        printRoute(locations);
        mapka.setCenter({ lat: latt, lng: lonn });
        mapka.setZoom(16);
        setShowRoutee(true);
      }
    });
    for (var i = 0; i < markerss.length; i++) {
      markerss[i].setMap(null);
    }
    setMarkerss([]);
    setDetails([]);
  }

  return (
    <>
      <div className="leftPanel">
        <Box
          display="flex"
          flexDirection={"column"}
          maxWidth={400}
          alignItems="center"
          justifyContent={"center"}
          margin="auto"
          marginTop={10}
          marginLeft={2}
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
        </Box>
      </div>
      <div className="rightPanel">
        <List
          display="flex"
          sx={{
            overflow: "auto",
            width: "100%",
            maxHeight: 800,
            background: "transparent",
            margin: "auto",
            marginTop: "65px",
            position: "relative",
          }}
        >
          {loadingData &&
            datails.map((element, index) => {
              return (
                <ListItem
                  // key={element}
                  disableGutters
                  onClick={(e) => onClickList(e, element)}
                  onMouseOver={(e) => changeBackgroundYellow(e, element)}
                  onMouseOut={(e) => changeBackgroundWhite(e, element)}
                  sx={{
                    background: "white",
                    margin: "auto",
                    marginTop: "10px",
                    padding: "5px",
                    borderRadius: "7px",

                  }}
                  secondaryAction={
                    <IconButton
                      type="button"
                      aria-label="comment"
                      onClick={() => {
                        showRoute(element.id, element.lat, element.lon);
                      }}
                    >
                      <PersonSearchIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    sx={{ paddingLeft: "4px", background: "transparent" }}
                    primary={`${element.name}`}
                  />
                </ListItem>
              );
            })}
        </List>
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

      </div>
      <div className="routePanel">
        <List
          sx={{
            maxWidth: "180px",
            background: "transparent",
            margin: "auto",
            marginTop: "10px",
            padding: "3px",
            borderRadius: "7px",
            position: "relative",
            marginLeft: "1rem",
            display: "inline-block",
            whiteSpace: "nowrap",
          }}
        >
          {showRoutee &&
            routeListUpdate &&
            locations.map((element) => {
              // console.log("Route",element);
              return (
                <>
                  <ListItem
                    //key={element.lat}
                    disableGutters
                    sx={{
                      margin: "5px",
                      background: "white",
                      display: "inline-block",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "7px",
                      borderStyle: "solid",
                    }}
                  >
                    <ListItemText
                      sx={{
                        paddingLeft: "4px",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >{`${element.Name}`}</ListItemText>
                  </ListItem>
                  <ListItem
                    disableGutters
                    sx={{
                      width: "28px",

                      display: "inline-block",

                      alignItems: "bottom",
                    }}
                  >
                    {<img src={imga} alt="" height="26px" />}
                  </ListItem>
                </>
              );
            })}
          {locations === undefined ? ("") : locations.length <= 1 ? ("s") : (
            <ListItem
              disableGutters
              sx={{
                margin: "5px",
                background: "white",
                borderStyle: "solid",
                borderColor: "red",
                display: "inline-block",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "7px",
              }}
            >
              <ListItemText
                sx={{
                  paddingLeft: "4px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Export to phone
              </ListItemText>
            </ListItem>
          )}
        </List>
      </div>
      <div
        id="googleMap"
        className="map"
        style={{ width: "100%", height: "100%" }}
        ref={setMap}
      ></div>
    </>
  );
}
function Map() {
  const [map, setMap] = useState(0);

  useEffect(() => {
    if (map !== 0) {
      console.log(map);
      const mapaaa = new window.google.maps.Map(map, {
        center: { lat: 51.110437, lng: 17.035019 },
        zoom: 14,
      });
      const marker = new window.google.maps.Marker({
        position: { lat: 51.109792, lng: 17.054004 },
        map: mapaaa,
      });
    }
  }, [map]);
  return (
    <div
      id="googleMap"
      style={{ width: "100%", height: "600px" }}
      ref={setMap}
      // className={`map ${props.className}`}
      // style={props.style}
    ></div>
  );
}
export default DetailsPoi;
