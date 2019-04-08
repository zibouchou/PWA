const cacheName = 'V1';


self.addEventListener('install', evt => {
    console.log('install evt' ,evt);
});

self.addEventListener('activate', evt => {
    console.log('activate evt', evt);
    //Suppression du cache non souhaité
    evt.waitUntil(
        caches.keys().then(cacheName => {
            return Promise.all(
                cacheNames.map(cache => {
                    if(cache !== cacheName){
                        return caches.delete(cache);
                    }
                })
            )
        })
    );
});

self.addEventListener('fetch', evt => {
    /*if(!navigator.onLine){
        const headers = { headers: { 'Content-Type': 'text/html;charset=utf-8'}};
        evt.respondWith(new Response('<h1>Pas de connexion internet</h1><div>Application en mode dégradé. Veuillez vous connecter</div>', headers));
    }*/
    evt.respondWith(
        fetch(evt.request)
            .then(res => {
                //cloner la réponse du serveur
                const resClone = res.clone();
                //ensuite ouvrir le cache
                caches
                    .open(cacheName)
                    .then(cache => {
                        //Ajout de la réponse au cache
                        cache.put(evt.request, resClone);
                    });
                return res;
            }).catch(err => caches.match(evt.request).then(res => res))      //Si on perd la connexion le catch sera lancé car réponse présente dans le cache
    );
    console.log('fetch event sur url ' ,evt.request.url);
})