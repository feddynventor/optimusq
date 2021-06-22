var serviamoil;
var nomeCassa;
var jingle;
var ws = new WebSocket('ws://' + address + ':'+port+'/');

document.addEventListener("DOMContentLoaded", function(){
    // CONFIGURAZIONE STILE
    console.log(conf)
    let style = document.createElement("style")
    style.innerHTML = ".divTable.table .divTableCell:nth-child(even) {background: "+conf.colore.primario+";}"
    style.innerHTML += ".divTable.table .divTableHeading {background: "+conf.colore.primario+";color: "+conf.colore.titoli+"}"
    style.innerHTML += ".divTable.table .divTableBody .divTableCell {color: "+conf.colore.cassa+";}"
    style.innerHTML += ".divTable.table .divTableHeading .divTableHead {font-size: "+conf.dimensioni_testo.titoli+"}"
    document.head.appendChild(style);

    if (conf.testgraphics)
        document.getElementById("testbutton").style.display = "block";


    // AUDIO
    var audioc = document.getElementById("audioc")
    serviamoil = document.getElementById("serviamo")
    jingle = document.getElementById("jingle")
    nomeCassa = document.getElementById("nomeCassa")
    
    audioc.onended = function(){
        last_numeri.shift()
    }
    jingle.onended = function(){
        if (conf.suono.nomeCassa){
            nomeCassa.setAttribute("src","assets/"+last_numeri[last_numeri.length-1][0].toLowerCase()+".mp3")
            nomeCassa.play()
        } else if (conf.suono.numero)
            serviamoil.play()
    }
    nomeCassa.onended = function(){
        if (conf.suono.numero)
            serviamoil.play()
    }
    serviamoil.onended = function(){
        console.log(last_numeri[last_numeri.length-1][0],"assets/"+last_numeri[last_numeri.length-1][1]+".mp3")
        audioc.setAttribute("src","assets/"+last_numeri[last_numeri.length-1][1]+".mp3")
        audioc.play()
    }
});
var last_numeri = [];   //lista dei numeri da pronunciare


var busyList = []
ws.onmessage = function (event) {
    let data = JSON.parse(event.data)
    if (data.type === "uuid" || data.type === "disconnect")
        return
    if (conf.ordine){
        if (conf.ordine_asc)
            var list = data.list.sort((a, b) => a["cassa"].localeCompare(b["cassa"]))
        else
            var list = data.list.sort((a, b) => b["cassa"].localeCompare(a["cassa"]))
    }
    console.log(data);

    if (data.stop != undefined){  
        // arriva quando per es il numero è stato mandato indietro, per evitare confusione
        nomeCassa.pause()
        nomeCassa.currentTime = 0;
        serviamoil.pause();
        serviamoil.currentTime = 0;
    }

    document.getElementById("listaCasse").innerHTML = ""

    list.forEach(dat => {
        let row = document.createElement('div');
        row.setAttribute("class","divTableRow")
        row.setAttribute("id","cassa"+dat.cassa)

        // console.log(dat.cassa, dat.numero, data.new)
        if (dat.cassa==data.new && data.mute==undefined){
            if (conf.suono.jingle)
                jingle.play()
            else if (conf.suono.nomeCassa){
                nomeCassa.setAttribute("src","assets/"+dat.cassa.toLowerCase()+".mp3")
                nomeCassa.play()
            } else if (conf.suono.numero)
                serviamoil.play()
            

            last_numeri.push( [dat.cassa, dat.numero] )
            
        }

        //console.log(dat)
        let numCassa = document.createElement("div")
        numCassa.setAttribute("class","divTableCell")
        numCassa.setAttribute("style","font-size: "+conf.dimensioni_testo.cassa)
        numCassa.innerHTML = dat.cassa

        let numero = document.createElement("div")
        numero.setAttribute("class","divTableCell")
        numero.setAttribute("style","font-size: "+conf.dimensioni_testo.numero+"; color:"+conf.colore.numero)
        numero.setAttribute("id","Ncassa"+dat.cassa)
        numero.innerHTML = (dat.numero!=undefined)?dat.numero:""

        row.appendChild(numCassa)
        row.appendChild(numero)
    
        document.getElementById("listaCasse").appendChild(row);
    });

    if ( list.find(o=>o.cassa === data.new).busy ){
        var interval_id = window.setInterval(()=>{}, 99999);
        for (var i = 0; i < interval_id; i++)
            window.clearInterval(i);
        document.getElementById("cassa"+data.new).setAttribute("bgcolor", conf.colore.cassa_chiusa)
        
        if (!busyList.includes(data.new))
            busyList.push(data.new)
    } else {
        const index = busyList.indexOf(data.new);
        if (index > -1) {
        busyList.splice(index, 1);
        }

        if (conf.lampeggia){
            let timesRun = 0;
            var interval = setInterval(function(){
                timesRun += 1;
                if(timesRun > parseInt((conf.tempo_lampeggio*1000)/120)){
                    clearInterval(interval);
                    document.getElementById("cassa"+data.new).style.setProperty("background","","important")
                    document.getElementById("Ncassa"+data.new).style.setProperty("background","","important")
                }
                document.getElementById("cassa"+data.new).style.setProperty("background",(timesRun%2==0)?conf.colore.lampeggio:"","important")
                document.getElementById("Ncassa"+data.new).style.setProperty("background",(timesRun%2==0)?conf.colore.lampeggio:"","important")
            }, 120); 
        }
    }

    busyList.forEach(element => {   //viene sovrascritta la tabella, ricolora tutto
        document.getElementById("cassa"+element).style.setProperty("background",conf.colore.cassa_chiusa)
        document.getElementById("Ncassa"+element).style.setProperty("background",conf.colore.cassa_chiusa)
    });

}

ws.onclose = function() {
    window.location.reload()
}

ws.onerror = function (error) {
    alert("Errore di comunicazione con il server.")
};