/* eslint-disable no-restricted-globals */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
// import { registerRoute } from 'workbox-routing';
// import { NetworkFirst } from 'workbox-strategies';
// sw inspect: chrome://serviceworker-internals/
// 即时激活最新 sw: https://stackoverflow.com/questions/40100922/activate-updated-service-worker-on-refresh
self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();
// registerRoute(/index\.html/, new NetworkFirst());
// registerRoute(/\/static\//, new NetworkFirst());
console.log('sw run 10');
/* eslint-enable no-restricted-globals */
