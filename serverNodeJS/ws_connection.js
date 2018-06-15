const WebSocket = require('ws');
const fs = require('fs');

const WS_Port = JSON.parse(fs.readFileSync('./settings.json').toString()).WS_Port;

const WS_Server = new WebSocket.Server({ port: WS_Port });

WS_Server.on('connection', ws => {

  console.log('Connection!');
    
  ws.on('message', message => {

    //console.log('received: %s', message);
    
    WS_Server.clients.forEach(client => {

      if(ws !== client){

        if(client.readyState === WebSocket.OPEN) {

          client.send(message);
  
        }//if

      }//if

    });

  });
  
});

module.exports = WS_Port;