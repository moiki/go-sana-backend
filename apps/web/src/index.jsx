import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

if (import.meta.env.PROD) {
    import('virtual:pwa-register').then(({registerSW}) => {
        registerSW({immediate: true});
    });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);