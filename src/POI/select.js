import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import NativeSelect from "@mui/material/NativeSelect";

function Select(props) {
  const handleSelectChange = (event) => {
    if (event.target.name === "Type of places") {
      localStorage.setItem("places", event.target.value);
    } else if (event.target.name === "Type of transport") {
      localStorage.setItem("transport", event.target.value);
    }
  };

  return (
    <Box sx={{ minWidth: 120, margin: 3 }}>
      <FormControl fullWidth>
        <InputLabel variant="standard" htmlFor="uncontrolled-native">
          {props.name}
        </InputLabel>
        <NativeSelect
          onChange={handleSelectChange}
          defaultValue={30}
          inputProps={{
            name: props.name,
            id: "uncontrolled-native",
          }}
        >
          {props.option.map((item) => {
            return (
              <option value={item}>
                {/* {localStorage.setItem("transport", item)} */}
                {item}
              </option>
            );
          })}
        </NativeSelect>
      </FormControl>
    </Box>
  );
}
export default Select;
