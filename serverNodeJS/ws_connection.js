const WebSocket = require('ws');
const fs = require('fs');

const WS_Port = JSON.parse(fs.readFileSync('./settings.json').toString()).WS_Port;

const WS_Server = new WebSocket.Server({ port: WS_Port });

let Recorder = null;

WS_Server.on('connection', ws => {

  console.log(`${ws._socket.remoteAddress}:${ws._socket.remotePort} Connection!`);

  console.log(WS_Server.clients.size);

  //ws.send(JSON.stringify({'messageType': 'localAddress', 'message':`${ws._socket.remoteAddress}:${ws._socket.remotePort}`}));

  ws.on('message', message => {

    let messObj = JSON.parse(message);

    console.log(`MESSAGE : ${messObj.messageType}`);

    if(!Recorder){
      
      if(messObj.messageType === 'Recorder'){

        Recorder = {'ws': ws, 'Address': `${ws._socket.remoteAddress}:${ws._socket.remotePort}`};

        Recorder.ws.on('close', code => {

          Recorder = null;

        });

      }//if

    }//if
    else{

      if(messObj.messageType === 'RTC-Connection' || messObj.messageType === 'RTC-ICE'){

        if(Recorder.Address !== `${ws._socket.remoteAddress}:${ws._socket.remotePort}`){
  
          Recorder.ws.send(message);
  
        }//if
        else{
  
          WS_Server.clients.forEach(client => {
    
            if(Recorder.Address !== `${client._socket.remoteAddress}:${client._socket.remotePort}`){
      
              if(client.readyState === WebSocket.OPEN) {
      
                client.send(message);
        
              }//if
      
            }//if
      
          });
  
        }//else
  
      }//if

    }//else

  }); 

  
});

module.exports = WS_Port;