#!/usr/bin/env node
const https = require('https')
const fs = require('fs')
const WebSocket = require('ws')
const uuid = require('uuid/v1')
const chalk = require('chalk')
const clear = require('clear')
const cursor = require('cli-cursor')
const args = require('minimist')(process.argv.slice(2))
var   port = process.env.PORT || args.port || args.p || 7000
var   max_queue_per_cassa = 10
const verbose = !args.nolog
const identify = !args.noid
const { cert } = args
const { key } = args

// LICENZA ================

const http = require("http")
const options = {
  hostname: 'feddynventor.altervista.org',
  path: '/license.txt',
  method: 'GET'
}

const req = http.request(options, res => {
  // console.log(`statusCode: ${res.statusCode}`)
  if (res.statusCode != 200)
    throw new Error("Licenza scaduta o impossibile controllare licenza")

  res.on('data', d => {
    if ( d.toString().localeCompare("J3986BAmt2bMRtmrjvNQmn92bYMd9mcxXFzBM2ykweSEwxaRNxZjC22HqMQ8DvBHG85T2de9CFLnCUxe8Wk3rv7QyeuanRJkTXZzAvaU6VxTw8YhnTEGzjSuzwv7wgUd" ))
      throw new Error("Licenza scaduta")
  })
})
req.on('error', error => {  
  throw new Error("Impossibile controllare licenza")
})
req.end()

// CONfIGURAZIONI
  try {
    let readData = fs.readFileSync("./server.conf", 'utf8');
    readData = JSON.parse(readData)
    port = readData.port
    max_queue_per_cassa = readData.max_queue_per_cassa
  } catch (error) {
    throw new Error("File di configurazione mancante o danneggiato",error)
  }

// APP ===================

let wss
var casse = []
var progressivo = 0

clear()
cursor.hide()

// Create websocket server.
if (cert && key) {
  // SSL.
  log(chalk.yellow('🔐 Using SSL'))
  const server = https.createServer({
    cert: fs.readFileSync(cert),
    key: fs.readFileSync(key)
  })

  wss = new WebSocket.Server({ server })
  server.listen(port, onListening)
} else {
  // Non SSL.
  wss = new WebSocket.Server({ port }, onListening)
}

// Will map clients to channels based on the URL path.
const channels = {}

wss.on('connection', (ws, req) => {
  log(`Total clients: ${chalk.white(wss.clients.size)}`)
  const { host } = req.headers
  const channelId = req.url.substring(1)
  log(`CHANNEL: ${chalk.white(channelId)}`)

  // Add client to channel.
  channels[channelId] = channels[channelId] || []
  channels[channelId].push(ws)


  if (identify) {
    const id = uuid()
    if (verbose) log(`NEW client: ID: ${chalk.white(id)} @${chalk.blue(host)}`)

    // Send UUID to client.
    send(ws, { type: 'uuid', data: id })

    ws.on('close', (ws) => {
      if (verbose) log(`Client ${id} DISCONNECTED`)
      const message = JSON.stringify({
        type: 'disconnect',
        message: 'cya'
      })
      broadcast({ ws, channelId, message })
    })
  }

  ws.on('message', (message) => {
	if (verbose) log(`MSG from ${host}`, chalk.gray(message))

	let input = ""
	try{
		input = JSON.parse(message)
	}catch(err){
    console.log("Errore messaggio")
		return
	}
	//console.log(input)

	if ( casse.find(o=>o.cassa === input.cassa) === undefined ){ //è già nell'array
		input.busy = false
		casse.push(input)
	}

	if ("busy" in input){
		let index = casse.findIndex(o=>o.cassa === input.cassa)
		if (input.busy == false)
			casse[ index ].busy = false
		else
			casse[ index ].busy = !casse[ index ].busy
    
		message = JSON.stringify( {new:input.cassa, list:casse, mute:1} )

	} else {
    let index = casse.findIndex(o=>o.cassa === input.cassa)

    if (casse[ index ].history == undefined)
      casse[ index ].history = []
    if (casse[ index ].history_ago == undefined)
      casse[ index ].history_ago = 0
      
		if (input.dir==1){
      if ( casse[ index ].history_ago > 0 ){
        casse[ index ].history_ago--
        casse[ index ].numero = casse[ index ].history[ casse[ index ].history.length-1 - casse[ index ].history_ago ]
      }else{
        progressivo++
        if (progressivo>99)
          progressivo=1

        casse[ index ].history.push(progressivo)
        if (casse[ index ].history.length > 10)
          casse[ index ].history.shift()  //non vogliamo diventi enorme

        casse[ index ].numero = progressivo

      }
      
/*    
			progressivo++
      if (progressivo>99)
        progressivo=1

      casse[ index ].history.push(progressivo)
      if (casse[ index ].history.length > 10)
        casse[ index ].history.shift()  //non vogliamo diventi enorme
      
      casse[ index ].history_ago = 0
      casse[ index ].numero = progressivo*/
    
    }
		else if (input.dir==-1){
			//progressivo--
      if (casse[ index ].history != undefined){

        if ( casse[ index ].history_ago < casse[ index ].history.length-1){
          if (casse[ index ].history_ago != undefined)
            casse[ index ].history_ago++
          else
            casse[ index ].history_ago = 1

          casse[ index ].numero = casse[ index ].history[ casse[ index ].history.length-1 - casse[ index ].history_ago ]
        }

      }
    }
	}
	if (input.dir==1)
		message = JSON.stringify( {new:input.cassa, list:casse} )  //comunica aggiornamento
	else if (input.dir==-1)
		message = JSON.stringify( {new:-1, list:casse, mute:1, stop:1} )  
    //non fare suoni e lampeggii sul display, 'stop' ferma tutti gli audio in play

  //console.log(JSON.parse(message))
	broadcast({ ws, channelId, message })
  })

  ws.on('error', (err) => {
    log(chalk.red('ERROR:'), err)
  })
})

function getWss() {}

function onListening() {
  const noidMsg = identify ? '' : ` --${chalk.white('noid')}`
  const nologMsg = verbose ? '' : ` --${chalk.white('nolog')}`
  console.log(
    chalk.yellow(`LISTENING on PORT ${chalk.white(port)}${noidMsg}${nologMsg}`)
  )
}

function broadcast({ ws, channelId, message }) {
  if (!channels[channelId]) {
    log(`Channel ${channelId} does not exist!`)
    return
  }

  if (!channels[channelId].length) {
    log(`Removed empty channel: ${channelId}`)
    delete channels[channelId]
    return
  }

  channels[channelId].map((client) => {
    if (client === ws) return // Skipping message sender.
    if (client.readyState !== WebSocket.OPEN) return
    client.send(message, (error) => {}) // eslint-disable-line
  })
}

function send(ws, message) {
  const data = JSON.stringify(message)
  if (ws.readyState !== WebSocket.OPEN) return
  ws.send(data, (error) => {}) // eslint-disable-line
}

function log() {
  // Single line basic info.
  if (!verbose) {
    const message = Array.prototype.join.call(arguments, ' ')
    try {
      process.stdout.clearLine()
    } catch (e) {}
    process.stdout.write(`\r${message}\r`)
    return
  }

  const ts = new Date().toISOString()
  console.log(`${chalk.dim(ts)}:`, ...arguments)
}

module.exports = {
  onListening,
  broadcast,
  send
}
