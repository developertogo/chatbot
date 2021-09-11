import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';

import { createMuiTheme, CssBaseline, MuiThemeProvider } from '@material-ui/core';

import App from './App';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#967FE3',
    },
    secondary: {
      main: '#94E2C5',
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <Fragment>
      <CssBaseline />
      <MuiThemeProvider theme={theme}>
        <App />
      </MuiThemeProvider>
    </Fragment>
  </React.StrictMode>,
  document.getElementById('root')
);
