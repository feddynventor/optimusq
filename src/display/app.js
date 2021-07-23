var serviamoil;
var nomeCassa;
var jingle;
var ws = new WebSocket('ws://' + address + ':'+port+'/');

document.addEventListener("DOMContentLoaded", function(){
    // CONFIGURAZIONE STILE
    console.log(conf)
    let style = document.createElement("style")
    // style.innerHTML = ".divTable.table .divTableCell {background: "+conf.colore.sfondo+";}"
    // if (conf.layout==1)  //Verticale : Alterna colore tra colonna dispari e colonna pari
    //     style.innerHTML += ".divTable.table .divTableCell:nth-child(even) {background: "+conf.colore.primario+";}"
    // if (conf.layout==2){  //Orizzontale : monocolore
    //     // style.innerHTML += "html, body {margin: 0; height: 100%; overflow: hidden}"   // disattiva scrolling manuale
    //     style.innerHTML += ".divTable.table .divTableCell:nth-child {background: "+conf.colore.primario+";}"
    // }
    style.innerHTML += ".divTable.table .divTableHeading {background: "+conf.colore.titoliSfondo+";color: "+conf.colore.titoli+"}"
    style.innerHTML += ".divTable.table .divTableBody .divTableCell {color: "+conf.colore.cassa+";}"
    style.innerHTML += ".divTable.table .divTableHeading .divTableHead {font-size: "+conf.dimensioni_testo.titoli+"}"
    document.head.appendChild(style);

    if (conf.testgraphics)
        document.getElementById("testbutton").style.display = "block";

    if (conf.layout == 2){
        // Prepara una unica riga
        let row = document.createElement('div');
        row.setAttribute("class","divTableRow")
        row.setAttribute("id","tableSingleRow")
        document.getElementById("listaCasse").appendChild(row);
    } else if (conf.layout == 1){
        // Aggiungi una riga header
        /**
		<div class="divTableHeading">
			<div class="divTableRow">
				<div class="divTableHead">Cassa</div>
				<div class="divTableHead">Serviamo il</div>
			</div>
		</div>
         */
        let tableHeading = document.createElement("div")
        tableHeading.setAttribute("class","divTableHeading")
        let tableRow = document.createElement("div")
        tableRow.setAttribute("class","divTableRow")
        let cell1 = document.createElement("div")
        cell1.setAttribute("class","divTableHead")
        cell1.innerHTML = conf.testo.tabella.titolo_cassa
        let cell2 = document.createElement("div")
        cell2.setAttribute("class","divTableHead")
        cell2.innerHTML = conf.testo.tabella.titolo_numero

        tableRow.appendChild(cell1)
        tableRow.appendChild(cell2)
        
        tableHeading.appendChild(tableRow)
        
        document.getElementById("root").prepend(tableHeading)
    }


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

    if (conf.layout == 1){  // Layout tabella con righe e due celle (2 colonne)
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
            numCassa.setAttribute("style","font-size: "+conf.dimensioni_testo.cassa+"; color:"+conf.colore.cassa)
            numCassa.innerHTML = conf.testo.tabella.cassa+dat.cassa

            let numero = document.createElement("div")
            numero.setAttribute("class","divTableCell")
            numero.setAttribute("style","font-size: "+conf.dimensioni_testo.numero+"; color:"+conf.colore.numero+"; background-color: "+conf.colore.sfondo)
            // numero.setAttribute("id","Ncassa"+dat.cassa)
            let numeroText = document.createElement("div")
            numeroText.setAttribute("id","Ncassa"+dat.cassa)
            numeroText.setAttribute("style","background-color: "+conf.colore.primario+"; border-radius: "+conf.raggioRettangoloNumero+"px;")
            numeroText.innerHTML = (dat.numero!=undefined)?(conf.testo.tabella.numero+dat.numero):""
            numero.appendChild(numeroText)

            row.appendChild(numCassa)
            row.appendChild(numero)
        
            document.getElementById("listaCasse").appendChild(row);
        });
    } else if (conf.layout == 2){  // Layout unica riga con contenitori affiancati (celle o colonne)
        document.getElementById("tableSingleRow").innerHTML = ""

        list.forEach(dat => {
            let container = document.createElement('div');
            container.setAttribute("class","divTableCell")
            container.setAttribute("id","cassa"+dat.cassa)

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
            let numCassa = document.createElement("p")
            numCassa.setAttribute("style","font-size: "+conf.dimensioni_testo.cassa+"; color:"+conf.colore.cassa+"; margin: 2vh")
            numCassa.innerHTML = conf.testo.box.cassa+dat.cassa

            let numero = document.createElement("p")
            numero.setAttribute("style","font-size: "+conf.dimensioni_testo.numero+"; color:"+conf.colore.numero+"; background-color: "+conf.colore.primario+"; border-radius: "+conf.raggioRettangoloNumero+"px; margin: 2vh")
            numero.setAttribute("id","Ncassa"+dat.cassa)
            numero.innerHTML = (dat.numero!=undefined)?(conf.testo.box.numero+dat.numero):""

            container.appendChild(numCassa)
            // container.appendChild(document.createElement("br"))
            container.appendChild(numero)
            
            document.getElementById("tableSingleRow").appendChild(container);
        });
    }

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
                    document.getElementById("cassa"+data.new).style.setProperty("background",conf.colore.sfondo,"important")
                    document.getElementById("Ncassa"+data.new).style.setProperty("background",conf.colore.primario,"important")
                }
                document.getElementById("cassa"+data.new).style.setProperty("background",(timesRun%2==0)?conf.colore.lampeggio:conf.colore.sfondo,"important")
                document.getElementById("Ncassa"+data.new).style.setProperty("background",(timesRun%2==0)?conf.colore.lampeggio:conf.colore.primario,"important")
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