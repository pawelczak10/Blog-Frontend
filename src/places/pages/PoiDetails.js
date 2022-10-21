import React, {  useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../shared/components/FormElements/Button";
import { useHttpClient } from "../../shared/hooks/http-hook";
import InputSlider from "./../../POI/slider";
import Select from "./../../POI/select";

import Box from "@mui/material/Box";
import "./PoiDetails.css";
function DetailsPoi() {
  const { sendRequest } = useHttpClient();
  const address = useParams().address;
  console.log(address)
  const [loadingData, setLoadingData] = useState(false);
  const [datails, setDetails] = useState([]);

  const fetchUsers = async () => {
    try {
      const responseData = await sendRequest(
        "https://www.overpass-api.de/api/interpreter?data=[out:json];node[amenity=school](around:2000,51.066661, 17.013243);out%20meta;"
      );
      return responseData.elements.map((item) => {
        setDetails((current) => [...current, item.tags.name]);

        setLoadingData(true);
      });
    } catch (err) {}
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
        <Select name="Type of transport" option={["drive", "walk","public transport"]}/>
        <Select name="Type of places" option={["restaurants", "greenspace","school"]}/>

        <Button className="buttons" danger type="button" onClick={fetchUsers}>
          SHOW DETAILS
        </Button>
        {loadingData &&
          datails.map((element, index) => {
            return (
              <div key={index}>
                <h2>{element}</h2>
              </div>
            );
          })}
        {/* </div> */}
      </Box>
    </>
  );
}

export default DetailsPoi;
