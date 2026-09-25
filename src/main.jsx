import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root.jsx';
import './styles/global.css';
import './pixel/pixel.css';
import './classic/classic.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
