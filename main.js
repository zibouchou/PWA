console.log('hello depuis main');
const technosDiv = document.querySelector('#technos');


function loadTechnologies() {
    fetch('http://localhost:3001/technos')
        .then(response => {
            response.json()
                .then(technos => {
                    const allTechnos = technos.map(t => `<div><b>${t.name}</b> ${t.description}  <a href="${t.url}">site de ${t.name}</a> </div>`)
                            .join('');
            
                    technosDiv.innerHTML = allTechnos;
                    createData(technos); 
                });
        })
        .catch(console.error);
}

loadTechnologies();


if(navigator.serviceWorker){
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
                            .catch(err => console.error);
    })
    navigator.addEventListener('message', function(event){
        console.log("index a recu le message " + event.data);
        event.ports[0].postMessage("index  dit 'Hello back!'");
    })
    
}

//fonction d'envoi de message au SW 
function send_message_to_sw(msg){
    return new Promise(function(resolve, reject){
      //création du canal de message
      var msgCan = new MessageChannel();
  
      //gestion des réponses du SW
      msgCan.port1.onmessage = function(event){
        if(event.data.error){
          reject(event.data.error);
        }else{
          resolve(event.data)
        }
      };
  
      //envoi du message au sw avec le port pour la réponse
      navigator.serviceWorker.controller.postMessage("la page index.html dit: '"+msg+"'", [msgCan.port2]);
    });
  }

function createData(technos){
    if(window.indexedDB){
    var request = indexedDB.open("technosDB", 2);

    request.onerror = function(e){
        console.log(e)
    }

    request.onupgradeneeded = function(e){
        console.log("fonction appelée");
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
}


