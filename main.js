console.log('hello depuis main');
const technosDiv = document.querySelector('#technos');

function loadTechnologies(technos) {
    fetch('http://localhost:3001/technos')
        .then(response => {
            response.json()
                .then(technos => {
                    const allTechnos = technos.map(t => `<div><b>${t.name}</b> ${t.description}  <a href="${t.url}">site de ${t.name}</a> </div>`)
                            .join('');
            
                    technosDiv.innerHTML = allTechnos; 
                });
        })
        .catch(console.error);
}

loadTechnologies(technos);


if(navigator.serviceWorker){
    console.log('hello il y a un service worker');
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
                            .catch(err => console.error);
    })
    
}


if(window.indexedDB){
    var request = indexedDB.open("technosDB", 1);

    request.onerror = function(e){
        console.log(e)
    }

    request.onupgradeneeded = function(e){
        var db = e.target.result;
        var objectStore = db.createObjectStore("technos", {keyPath: "id"});
        objectStore.createIndex("name", "name", {unique: true});
        objectStore.transaction.oncomplete = function(e){
            var store = db.transaction(["technos"], "readwrite").objectStore("technos");
            for(var i = 0; technos.length; i++){
                store.add(technos[i]);
            }
        }
    }

    request.onsuccess = function(e){
        console.log("success");
    }
}

