importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

workbox.precaching.precacheAndRoute([
  { url: 'index.html', revision: null },
  { url: 'assets/logo.svg', revision: null },
  // populated automatically by injectManifest if you prefer
]);

workbox.routing.registerRoute(
  ({ url }) => url.pathname.endsWith('history.json'),
  new workbox.strategies.StaleWhileRevalidate({ cacheName: 'strava-data' })
);
