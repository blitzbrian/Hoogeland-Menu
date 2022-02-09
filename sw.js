const assets = [
    '/',
    'index.html',
    'favicon.png',
    'global.css',
    'build/bundle.css',
    'build/bundle.js',
    'https://pro.fontawesome.com/releases/v5.10.0/css/all.css',
    'https://pro.fontawesome.com/releases/v5.10.0/webfonts/fa-solid-900.woff2',
    'https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css',
];

self.addEventListener('install', (evt) => {
    evt.waitUntil(
        caches.open('site').then((cache) => {
            cache.addAll(assets);
        })
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.method != 'GET') return;
    event.respondWith(
        caches.open('site').then(function (cache) {
            return cache.match(event.request).then(function (response) {
                return fetch(event.request)
                    .then(function (response) {
                        cache.put(event.request, response.clone());
                        return response;
                    })
                    .catch(() => {
                        return response;
                    });
            });
        })
    );
});
