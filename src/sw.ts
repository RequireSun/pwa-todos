// sw inspect: chrome://serviceworker-internals/
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRouteAPI } from './offline/api';

declare const self: ServiceWorkerGlobalScope;

// 即时激活最新 sw: https://stackoverflow.com/questions/40100922/activate-updated-service-worker-on-refresh
self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST || []);
registerRouteAPI();
cleanupOutdatedCaches();
console.log('sw run 10');
