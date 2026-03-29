import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    black: {
      main: '#000000',
    },
    background: {
      default: '#000000',
      paper: '#1d1d1d',
      default2: '#2c2c2c',
    },
  },
});
