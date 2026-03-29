// theme.js
import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#ff7e33' },
    background: { default: '#ffffff', paper: '#f9f9f9' },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ff7e33' },
    background: { default: '#000000', paper: '#1d1d1d' },
  },
});
