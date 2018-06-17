const WebSocket = require('ws');
const fs = require('fs');

const WS_Port = JSON.parse(fs.readFileSync('./settings.json').toString()).WS_Port;

const WS_Server = new WebSocket.Server({ port: WS_Port });

let Recorder;

WS_Server.on('connection', ws => {

  console.log(`${ws._socket.remoteAddress}:${ws._socket.remotePort} Connection!`);

  console.log(WS_Server.clients.size);

  //ws.send(JSON.stringify({'messageType': 'localAddress', 'message':`${ws._socket.remoteAddress}:${ws._socket.remotePort}`}));

  ws.on('message', message => {

    let messObj = JSON.parse(message);

    // if(messObj.messageType === 'recorder'){

    //   Recorder = messObj.message;

    // }//if

    if(messObj.messageType === 'RTC-Connection' || messObj.messageType === 'RTC-ICE'){

      WS_Server.clients.forEach(client => {

        if(`${ws._socket.remoteAddress}:${ws._socket.remotePort}` !== `${client._socket.remoteAddress}:${client._socket.remotePort}`){
  
          if(client.readyState === WebSocket.OPEN) {
  
            client.send(message);
    
          }//if
  
        }//if
  
      });

    }//if

  }); 

  
});

module.exports = WS_Port;