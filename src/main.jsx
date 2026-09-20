import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AchievementProvider } from './lib/AchievementContext.jsx';
import './styles/global.css';
import './styles/game.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AchievementProvider>
      <App />
    </AchievementProvider>
  </React.StrictMode>
);
