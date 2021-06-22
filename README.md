# OptimusQ
#### Gestore ed Elimina Code con Display e client di avanzamento per la gestione centralizzata di una coda
* Websocket Server: realizzato in NodeJS gestisce una lista e condivide ad ogni istante il suo stato.
* Client Cassa: scritto in Python implementa l'interfaccia grafica con Qt e comunica con il WS Server
* Client Display: è un programma Python che esegue un Browser basato su Chromium in modalità Kiosk. Il browser implementa Javascript e ha il consenso alla riproduzione di audio.

## **Python**
Realizzato con versione 3.9.2
* PyQt5
* PyQtWebEngine
## **Librerie NodeJS**
[Base SocketServer](https://github.com/codealchemist/websocket-broadcast)
Realizzato con versione 14

Eseguire il comando nella directory del sorgente: `npm install`
