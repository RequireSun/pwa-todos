import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import reportWebVitals from './utils/reportWebVitals';
import { isPwa } from './utils/is-pwa';

navigator.serviceWorker.register('/pwa-todos/sw.js', { scope: '/pwa-todos/' }).then(reg => console.log(reg.scope));
// sw 更新是刷新页面的办法: https://juejin.cn/post/6844903792522035208
// 只要更新版本页面就会有闪烁, 需要找个解决办法 (loading 条或许可以解决)
let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('controllerchange');
    if (refreshing) {
        return;
    }
    refreshing = true;
    window.location.reload();
});

console.log('change and compile 10, is pwa:', isPwa());

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
