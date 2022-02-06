import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { isPwa } from './utils/is-pwa';
import './index.css';

navigator.serviceWorker.register('/pwa-todos/sw.js', { scope: '/pwa-todos/' }).then(reg => console.log(reg.scope));
// sw 更新是刷新页面的办法: https://juejin.cn/post/6844903792522035208
let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) {
        return;
    }
    refreshing = true;
    window.location.reload();
});

console.log('change and compile 8, is pwa:', isPwa());

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
