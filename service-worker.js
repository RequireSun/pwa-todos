if(!self.define){let e,s={};const t=(t,i)=>(t=new URL(t+".js",i).href,s[t]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=t,e.onload=s,document.head.appendChild(e)}else e=t,importScripts(t),s()})).then((()=>{let e=s[t];if(!e)throw new Error(`Module ${t} didn’t register its module`);return e})));self.define=(i,o)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(s[n])return;let r={};const l=e=>t(e,n),c={module:{uri:n},exports:r,require:l};s[n]=Promise.all(i.map((e=>c[e]||l(e)))).then((e=>(o(...e),r)))}}define(["./workbox-f683aea5"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"/pwa-todos/index.html",revision:"7ce7fa25b0b5df0b0561ce0b8224e75e"},{url:"/pwa-todos/static/css/main.d81d4504.css",revision:null},{url:"/pwa-todos/static/js/787.1a81e322.chunk.js",revision:null},{url:"/pwa-todos/static/js/main.63d07421.js",revision:null},{url:"/pwa-todos/static/js/main.63d07421.js.LICENSE.txt",revision:"ac1d32e2116a66660d06e2f6a5ba9780"}],{})}));
//# sourceMappingURL=service-worker.js.map
