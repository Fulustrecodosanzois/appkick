import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { AuthProvider } from './contexts/AuthContext';
import './styles.css';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// src/styles.css
`
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #121212;
  color: #ffffff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn {
  background-color: #00ff00;
  color: #000000;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #00cc00;
}

.btn-secondary {
  background-color: #333333;
  color: #ffffff;
}

.btn-secondary:hover {
  background-color: #444444;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #333333;
  background-color: #2a2a2a;
  color: #ffffff;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #333333;
}

.nav {
  display: flex;
  background-color: #1e1e1e;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.nav-item {
  margin-right: 15px;
  color: #ffffff;
  text-decoration: none;
  padding: 8px 15px;
  border-radius: 4px;
}

.nav-item:hover, .nav-item.active {
  background-color: #333333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.alert {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.alert-success {
  background-color: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
}

.alert-error {
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff0000;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.w-full {
  width: 100%;
}

.mb-4 {
  margin-bottom: 16px;
}
`