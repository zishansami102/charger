// scroll bar
import 'simplebar/src/simplebar.css';

import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
// import Web3 from 'web3';
//
import App from './App';
// import * as serviceWorker from './serviceWorker';
// import reportWebVitals from './reportWebVitals';

// ----------------------------------------------------------------------
function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

ReactDOM.render(
  <HelmetProvider>
    <BrowserRouter>
      <Web3ReactProvider getLibrary={getLibrary}>
        <App />
      </Web3ReactProvider>
    </BrowserRouter>
  </HelmetProvider>,
  document.getElementById('root')
);

// // If you want to enable client cache, register instead.
// serviceWorker.unregister();

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
