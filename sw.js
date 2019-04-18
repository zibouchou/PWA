'use strict';

const version = '201810300005::';

// Caches for different resources
const coreCacheName = version + 'core';
const pagesCacheName = version + 'pages';
const assetsCacheName = version + 'assets';

// Resources that will be always be cached
const coreCacheUrls = [
  '/offline/',
  'index.html',
  'main.js',
  'style.css',
];

function updateCoreCache() {
  return caches.open(coreCacheName)
    .then( cache => {
      // Make installation contingent on storing core cache items
      return cache.addAll(coreCacheUrls);
    });
}

function addToCache(cacheName, request, response) {
  caches.open(cacheName)
    .then( cache => cache.put(request, response) );
}

    // Remove old caches that don't match current version
function clearCaches() {
  return caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(key) {
        return key.indexOf(version) !== 0;
      }).map(function(key) {
        return caches.delete(key);
      })
    );
  })
}

self.addEventListener('install', event => {
  event.waitUntil(updateCoreCache()
    .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    clearCaches().then( () => {
      return self.clients.claim();
    })
  );
});


self.addEventListener('fetch', event => {

  let request = event.request,
      acceptHeader = request.headers.get('Accept');

  // HTML Requests
  if (acceptHeader.indexOf('text/html') !== -1) {
    // Try network first
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok)
            addToCache(pagesCacheName, request, response.clone());
          return response;
        })
      // Try cache second with offline fallback
      .catch( () => {
        return caches.match(request).then( response => {
            return response || caches.match('/offline/');
        })
      })
    );

  // Non-HTML Requests
  } else if (acceptHeader.indexOf('text/html') == -1) {
    event.respondWith(
      caches.match(request)
        .then( response => {
          // Try cache, then network, then offline fallback
          return response || fetch(request)
            .then( response => {
              if (response.ok)
                addToCache(assetsCacheName, request, response.clone());
              return response;
            })
          .catch( () => {
            return new Response('<svg role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>', { headers: { 'Content-Type': 'image/svg+xml' }});
          })
      })
    );
  }
});

self.addEventListener('message', function(event){
  console.log("SW received message: " + event.data);
  event.ports[0].postMessage("SW dit 'Hello back!'");
});

function send_message_to_client(client, msg){
  return new Promise(function(resolve, reject){
    //création du canal de message
    var msgCan = new MessageChannel();

    msgCan.port1.onmessage = function(event){
      if(event.data.error){
        reject(event.data.error);
      }else{
        resolve(event.data)
      }
    };

    
    client.postMessage("le SW dit: '"+msg+"'", [msgCan.port2]);
  });
}

function send_message_to_all_clients(msg){
  clients.matchAll().then(clients => {
    clients.forEach(client => {
      send_message_to_client(client, msg).then(m => console.log("SW a recu "+m));
    });
  })
}
