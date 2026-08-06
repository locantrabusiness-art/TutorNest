const CACHE_NAME = "tutornest-v1";

const FILES = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js"
];

self.addEventListener("install", e => {

    e.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => cache.addAll(FILES))

    );

});

self.addEventListener("fetch", e => {

    e.respondWith(

        caches.match(e.request)

        .then(response => response || fetch(e.request))

    );

});