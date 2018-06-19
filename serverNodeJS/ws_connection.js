const WebSocket = require('ws');
const fs = require('fs');

const WS_Port = JSON.parse(fs.readFileSync('./settings.json').toString()).WS_Port;

const WS_Server = new WebSocket.Server({ port: WS_Port });

let Recorder = null;

WS_Server.on('connection', ws => {

  console.log(`${ws._socket.remoteAddress}:${ws._socket.remotePort} Connection!`);

  console.log(WS_Server.clients.size);

  if(Recorder && WS_Server.clients.size === 2){

    Recorder.ws.send(JSON.stringify({'messageType': 'Send-RTC', 'message': ''}));

  }//if

  ws.on('message', message => {

    let messObj = JSON.parse(message);

    console.log(`MESSAGE : ${messObj.messageType}`);

    if(!Recorder){
      
      if(messObj.messageType === 'Recorder'){

        Recorder = {'ws': ws, 'Address': `${ws._socket.remoteAddress}:${ws._socket.remotePort}`};

        Recorder.ws.on('close', code => {

          Recorder = null;

        });

        setTimeout(() => {

          if(WS_Server.clients.size >= 2){

            Recorder.ws.send(JSON.stringify({'messageType': 'Send-RTC', 'message': ''}));
  
          }//if

        }, 300);

      }//if

    }//if
    else{

      if(messObj.messageType === 'RTC-Connection' || messObj.messageType === 'RTC-ICE'){

        if(Recorder.Address !== `${ws._socket.remoteAddress}:${ws._socket.remotePort}`){
  
          Recorder.ws.send(message);
  
        }//if
        else{
  
          let client = WS_Server.WS_GetClientByIndex(0);

          if(client.readyState === WebSocket.OPEN) {
      
            client.send(message);
    
          }//if
  
        }//else
  
      }//if
      else if(messObj.messageType === 'Stream-Start'){

        setTimeout(() => {

          if(WS_Server.clients.size >= 2){

            Recorder.ws.send(JSON.stringify({'messageType': 'Send-RTC', 'message': ''}));
  
          }//if

        }, 300);

      }//else if

    }//else

  }); 

  
});

WS_Server.WS_GetClientByIndex = function(index){

  if(Recorder){

    if(index < 0 || index >= WS_Server.clients.size - 1){

      return null;
  
    }//if
  
    let i = 0;
  
    for (let ws of WS_Server.clients.values()) {
      
      if(Recorder.Address !== `${ws._socket.remoteAddress}:${ws._socket.remotePort}`){

        if(i === index){
  
          return ws;
    
        }//if

        i++;

      }//if
  
    }//for

  }//if
  else{

    if(index < 0 || index >= WS_Server.clients.size){

      return null;
  
    }//if
  
    let i = 0;
  
    for (let ws of WS_Server.clients.values()) {
  
      if(i === index){
  
        return ws;
  
      }//if

      i++;
  
    }//for

  }//else

}//WS_GetClientByID

module.exports = WS_Port;