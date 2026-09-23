import React from 'react';
import ReactDOM from 'react-dom/client';
import PixelApp from './pixel/PixelApp.jsx';
import './styles/global.css';
import './pixel/pixel.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PixelApp />
  </React.StrictMode>
);
