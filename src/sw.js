/* eslint-disable no-restricted-globals */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
// import { registerRoute } from 'workbox-routing';
// import { NetworkFirst } from 'workbox-strategies';
self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();
// registerRoute(/index\.html/, new NetworkFirst());
// registerRoute(/\/static\//, new NetworkFirst());
console.log('sw run 10');
/* eslint-enable no-restricted-globals */
