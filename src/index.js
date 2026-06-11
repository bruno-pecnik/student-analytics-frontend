import React from 'react'; // default se generira cijeli file
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render( // pokrećem app.js 
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
