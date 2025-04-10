import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { fetchDlnkResource, fetchExternalResource } from './utils/externalApi';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// To fetch from dlnk.one
try {
  const data = await fetchDlnkResource('some-id', 1);
  // Handle the data
} catch (error) {
  // Handle the error
}

// To fetch any external resource
try {
  const data = await fetchExternalResource('https://some-url.com');
  // Handle the data
} catch (error) {
  // Handle the error
}
