import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Configuration, OpenAIApi } from "openai";
import "./PoiDetails.css";
import axios from "axios";
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Select from "../../POI/select";
import InputSlider from "../../POI/slider";
import { useHttpClient } from "../../shared/hooks/http-hook";
import Button from "../../shared/components/FormElements/Button";
import imga from "./smartphone-call.png";
import { AuthContext } from "../../shared/context/auth-context";
import { useHistory } from "react-router-dom";
import Modal from '../../shared/components/UIElements/Modal';

function DetailsPoi() {
  const { sendRequest } = useHttpClient();
  const [showMap, setShowMap] = useState(false);

  const [loadingData, setLoadingData] = useState(false);
  const [locations, setLocations] = useState();
  const [mapka, setMapka] = useState();
  const [markerss, setMarkerss] = useState([]);
  const [datails, setDetails] = useState([]);
  const [route, setRoute] = useState();
  const [showRoutee, setShowRoutee] = useState(false);
  const [routeListUpdate, setrouteListUpdate] = useState(false);
  const address = useParams().address; // here we get coordinates
  const [initialAdress, setInitialAdress] = useState();
  const [outputAI, setOutputAI] = useState();

  let directionsDisplay;

  const closeMapHandler = () => setShowMap(false);


  useEffect(() => {
    console.log("useEffectFirst");
    localStorage.setItem("places", "restaurant");
    localStorage.setItem("transport", "driving");
    localStorage.setItem("distance", "250");
    async function fetchData() {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address,
        )}&key=AIzaSyC-2XE_Y6V457WACQMLYmG7HYpJHf1SWQY`,
      );
      const coordinates = response.data.results[0].geometry.location;
      const origin = `${coordinates.lat},${coordinates.lng}`;
      localStorage.setItem('coordinates', origin);
      setInitialAdress(origin);
    }
    fetchData();
  }, []);

  const fetchPOI = async () => {

    console.log("fetchPOI");
    const origin = localStorage.getItem("coordinates"); // here we get place
    const place = localStorage.getItem("places");
    const distance = localStorage.getItem("distance");
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
          {
            name: item.tags.name,
            id: item.id,
            lat: item.lat,
            lon: item.lon,
          },
        ]);

        setLoadingData(true);

        const marker = new window.google.maps.Marker({
          position: { lat: item.lat, lng: item.lon },
          map: mapka,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          },
        });

        const infowindow = new window.google.maps.InfoWindow();
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
              mapka.setCenter({ lat: item.lat, lng: item.lon });
              mapka.setZoom(16);
              setShowRoutee(true);
              setrouteListUpdate(true);
              for (let i = 0; i < markerss.length; i++) {
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

  async function onSubmit(text) {
    const configuration = new Configuration({
      organization: process.env.ORGANIZATION,
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text.help,
      temperature: 0,
      max_tokens: 1000,
    });
    console.log(response.data.choices[0].text)
    setOutputAI(response.data.choices[0].text)
    setShowMap(true);
  }



  function printRoute() {
    const directionsService = new window.google.maps.DirectionsService();
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

    const request = {
      travelMode: window.google.maps.TravelMode.WALKING,
    };
    directionsDisplay.setDirections({ routes: [] });
    for (let i = 0; i < locations.length; i++) {
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
    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(result);
      }
    });
  }

  const [map, setMap] = useState(0);

  useEffect(() => {
    console.log("mapReload");
    if (map !== 0) {
      const startPlace = localStorage.getItem("coordinates");
      const array = startPlace.split(",");

      const mapaaa = new window.google.maps.Map(map, {
        center: {
          lat: parseFloat(array[0], 10),
          lng: parseFloat(array[1], 10),
        },
        zoom: 16,
      });

      const initialMarker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(array[0], 10),
          lng: parseFloat(array[1], 10),
        },
        map: mapaaa,
      });
      // markerss.push(initialMarker);
      setMapka(mapaaa);
      const street = address.split(",");
      const loc = [
        {
          Name: street[0],
          Lat: parseFloat(array[0], 10),
          Long: parseFloat(array[1], 10),
        },
      ];
      setLocations(loc);
    }
  }, [initialAdress]);

  function changeBackgroundYellow(e, element) {
    e.currentTarget.style.background = "yellow";

    markerss.forEach((i) => {
      if (
        i.getPosition().lat() === element.lat &&
        i.getPosition().lng() === element.lon
      ) {
        i.setIcon({
          url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
        });
      }
    });
  }

  function changeBackgroundWhite(e, element) {
    e.currentTarget.style.background = "white";
    markerss.forEach((i) => {
      if (
        i.getPosition().lat() === element.lat &&
        i.getPosition().lng() === element.lon
      ) {
        i.setIcon({
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        });
      }
    });
  }
  function onClickList(e, element) {
    let c = true;
    setrouteListUpdate(true);
    markerss.forEach((i) => {
      if (
        i.getPosition().lat() === element.lat &&
        i.getPosition().lng() === element.lon &&
        c
      ) {
        c = false;
        const latt = i.getPosition().lat();
        const lonn = i.getPosition().lng();

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
    for (let i = 0; i < markerss.length; i++) {
      markerss[i].setMap(null);
    }
    setMarkerss([]);
    setDetails([]);
  }
  const auth = useContext(AuthContext);
  const history = useHistory();

  const exportToPhone = async () => {
    console.log("exportRoute");
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const response = await axios({
        method: "POST",
        url: "http://localhost:5000/api/routes",
        headers: { Authorization: `Bearer ${auth.token}` },
        data: { route_owner: userData.userId, places: locations },
      });

      return response;
    } catch (error) {
      console.log("error");
    }
  };

  const {
    handleSubmit,
    control,
    setError,
    register,
    formState: { errors },
  } = useForm();
  return (
    <>
      <div className="leftPanel">
        <Box
          display="flex"
          flexDirection="column"
          maxWidth={400}
          alignItems="center"
          justifyContent="center"
          margin="auto"
          marginTop={10}
          marginLeft={2}
          padding={3}
          borderRadius={5}
          sx={{
            borderStyle: "solid",
            borderColor: "#F48FB1",
            background: "white",
          }}
        >
          <InputSlider />
          <Select
            name="Type of transport"
            option={["driving", "walking", "bicycling"]}
          />
          <Select
            name="Type of place"
            option={["restaurant", "bar", "school", "fast food", "bank"]}
          />

          <Button danger type="button" onClick={fetchPOI}>
            SHOW PLACES
          </Button>
        </Box>
        <form onSubmit={handleSubmit(onSubmit)} >
          <Box
            display="flex"
            flexDirection="column"
            maxWidth={400}
            alignItems="center"
            justifyContent="center"
            margin="auto"
            marginTop={10}
            marginLeft={2}
            padding={3}
            borderRadius={5}
            sx={{
              borderStyle: "solid",
              borderColor: "#F48FB1",
              background: "white",
            }}>
            <Controller
              control={control}
              name='help'
              key='help'
              render={({ field }) => (
                <TextField
                  label='Ask for help'
                  style={{ display: "flex", marginTop: "2rem", marginBottom: "2rem", with: "15rem" }}
                  {...register('help', { required: true })}
                  type='text'
                  variant='standard'
                />
              )}
            />
            <Button danger type='submit' style={{ marginTop: "2rem", margin: "center" }}>
              Ask for help
            </Button>
          </Box>
        </form>

      </div>
      <div className="rightPanel">
        <List
          display="flex"
          sx={{
            overflow: "scroll",
            overflowX: "hidden",
            width: "100%",
            maxHeight: 800,
            background: "transparent",
            paddingRight: "20px",
            marginTop: "65px",
            position: "relative",
          }}
        >
          {loadingData &&
            datails.map((element) => (
              <ListItem
                // key={element}
                disableGutters
                onClick={(e) => onClickList(e, element)}
                onMouseOver={(e) => changeBackgroundYellow(e, element)}
                onMouseOut={(e) => changeBackgroundWhite(e, element)}
                sx={{
                  borderStyle: "solid",
                  borderColor: "#F48FB1",
                  background: "white",
                  margin: "auto",
                  marginTop: "10px",
                  padding: "5px",
                  borderRadius: "7px",
                }}
              >
                <ListItemText
                  sx={{ paddingLeft: "4px", background: "transparent" }}
                  primary={`${element.name}`}
                />
              </ListItem>
            ))}
        </List>
      </div>
      <div className="routePanel">
        <List
          sx={{
            maxWidth: "180px",
            background: "transparent",
            margin: "auto",
            marginTop: "10px",
            marginBottom: "10px",
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
            locations.map((element) => (
              // console.log("Route",element);
              <ListItem
                // key={element.lat}
                disableGutters
                sx={{
                  display: "inline-block",
                  position: "relative",
                  width: "200px",
                  height: "50px",
                  background: "#F48FB1",
                  boxSizing: "border-box",
                  webkitClipPath:
                    "polygon(90% 0, 100% 50%, 90% 100%, 0% 100%, 10% 50%, 0% 0%)",
                  clipPath:
                    "polygon(90% 0, 100% 50%, 90% 100%, 0% 100%, 10% 50%, 0% 0%)",
                }}
              >
                <ListItemText
                  sx={{
                    paddingLeft: "30px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {`${element.Name}`}
                </ListItemText>
              </ListItem>
            ))}

          {locations === undefined ? (
            ""
          ) : locations.length <= 1 ? (
            ""
          ) : (
            <ListItem
              disableGutters
              onClick={exportToPhone}
              sx={{
                cursor: "pointer",
                display: "inline-block",
                position: "relative",
                width: "160px",
                height: "50px",
                background: "#ff0055",
                boxSizing: "border-box",
                webkitClipPath:
                  "polygon(100% 0, 100% 50%, 100% 100%, 0% 100%, 10% 50%, 0% 0%)",
                clipPath:
                  "polygon(100% 0, 100% 50%, 100% 100%, 0% 100%, 10% 50%, 0% 0%)",
              }}
            >
              <ListItemText
                sx={{
                  paddingLeft: "30px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Export to phone
                {/* <img src={imga} alt="" height="26px" /> */}
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
      />

      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >{outputAI}</Modal>
    </>
  );
}

export default DetailsPoi;
