import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Se usa HashRouter (en vez de BrowserRouter) porque GitHub Pages sirve
// archivos estáticos sin reescritura de rutas en el servidor. Con
// HashRouter, rutas como /#/servicios funcionan sin configuración extra.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
