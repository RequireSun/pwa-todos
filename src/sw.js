/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST || []);
console.log('sw run 5');
/* eslint-enable no-restricted-globals */
