import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import NativeSelect from "@mui/material/NativeSelect";

function Select(props) {
  return (
    <Box sx={{ minWidth: 120, margin: 3 }}>
      <FormControl fullWidth>
        <InputLabel variant="standard" htmlFor="uncontrolled-native">
          {props.name}
        </InputLabel>
        <NativeSelect
          defaultValue={30}
          inputProps={{
            name: props.name,
            id: "uncontrolled-native",
          }}
        >
          {props.option.map((item) => {
            return <option value={item}>{item}</option>;
          })}
          {/* <option value="drive">drive</option>
          <option value="walk">walk</option>
          <option value="public transport">public transport</option> */}
        </NativeSelect>
      </FormControl>
    </Box>
  );
}
export default Select;
