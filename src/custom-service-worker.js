import { precacheAndRoute } from 'workbox-precaching';

// Inject the Workbox manifest here
precacheAndRoute(self.__WB_MANIFEST);

// Custom fetch logic (optional)
self.addEventListener('fetch', (event) => {
  // Handle custom caching or network strategies
});
