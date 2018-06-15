const WebSocket = require('ws');
const fs = require('fs');

const WS_Port = JSON.parse(fs.readFileSync('./settings.json').toString()).WS_Port;

const WS_Server = new WebSocket.Server({ port: WS_Port });

WS_Server.on('connection', ws => {

  console.log(`${ws._socket.remoteAddress}:${ws._socket.remotePort} Connection!`);
    
  ws.on('message', message => {
    
    WS_Server.clients.forEach(client => {

      if(`${ws._socket.remoteAddress}:${ws._socket.remotePort}` !== `${client._socket.remoteAddress}:${client._socket.remotePort}`){

        if(client.readyState === WebSocket.OPEN) {

          client.send(message);
  
        }//if

      }//if

    });

  });
  
});

module.exports = WS_Port;