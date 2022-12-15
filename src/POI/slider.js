import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import AssistWalkerIcon from '@mui/icons-material/AssistWalker';

function InputSlider() {
  const [value, setValue] = React.useState(250);

  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
    // console.log(newValue);
    localStorage.setItem('distance', `${newValue}`);
  };

  return (
    <Box sx={{ width: 250 }}>
      <Typography id="input-slider" gutterBottom>
        Distance
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <AssistWalkerIcon />
        </Grid>
        <Grid item xs>
          <Slider
            step={250}
            min={250}
            max={3000}
            value={typeof value === 'number' ? value : 250}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
          />
        </Grid>
        <Grid item sx={{ width: '50px' }}>
          {value}m
        </Grid>
      </Grid>
    </Box>
  );
}
export default InputSlider;
