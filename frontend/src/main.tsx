import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css';
import { store } from './store';
import { Provider } from 'react-redux';
import { bootstrap } from './services/bootstrap';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import { initializeConfig } from './utils/configValidator';

// CRITICAL: Validate configuration BEFORE rendering React
// App will NOT render if required config is missing
const configValid = initializeConfig();

if (configValid) {
  // Initialize App Data
  bootstrap();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </Provider>
    </React.StrictMode>,
  )
}

