const APP_PREFIX = 'BudgetWise-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
    "./js/idb.js",
    "./js/index.js",
    './manifest.json',
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png",
];

self.addEventListener('install', function (e) {
    // tells browser to wait until work is complete before terminating worker
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('Installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE)
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        // .keys returns all cache names and sets it to keylist
        caches.keys().then(function (keyList) {
            // captures only caches with BudgetWise prefix
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            })
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(keyList.map(function (key, i) {
                if (cacheKeeplist.indexOf(key) === -1) {
                    console.log('deleting cache: ' + keyList[i]);
                    return caches.delete(keyList[i]);
                }
            }))
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) { 
                // if cache is available, respond with cache
                console.log('responding with cache : ' + e.request.url)
                return request
            } 
            else {       
                // if there are no cache, try fetching request
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }
        })
    )
});