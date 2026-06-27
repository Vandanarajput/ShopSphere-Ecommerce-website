import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 2500,
            style: {
              background: '#1F1A14',
              color: '#FAF6EE',
              fontSize: '14px',
              fontWeight: 500,
              padding: '12px 18px',
              borderRadius: '999px',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
              maxWidth: '420px',
            },
            success: {
              iconTheme: { primary: '#3D4D2E', secondary: '#FAF6EE' },
              style: { background: '#3D4D2E', color: '#fff' },
            },
            error: {
              iconTheme: { primary: '#fff', secondary: '#be123c' },
              style: { background: '#be123c', color: '#fff' },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
