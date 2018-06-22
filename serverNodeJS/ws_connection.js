const WebSocket = require('ws');
const fs = require('fs');

const WS_Port = JSON.parse(fs.readFileSync('./settings.json').toString()).WS_Port;

const WS_Server = new WebSocket.Server({ port: WS_Port });

let Recorder = null;

WebSocket.prototype.GetID = function(){

  return `${this._socket.remoteAddress}:${this._socket.remotePort}`;

}//function

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

        Recorder = {'ws': ws, 'ID': ws.GetID()};

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

        if(Recorder.ID !== ws.GetID()){

          let wsTo = WS_Server.WS_GetWSByID(messObj.ClientID);

          if(wsTo){

            messObj.ClientID = ws.GetID();

            wsTo.send(JSON.stringify(messObj));

          }//if
  
        }//if
        else{
  
          let client = WS_Server.WS_GetClientByIndex(0);

          if(client){

            if(client.readyState === WebSocket.OPEN) {

              messObj.ClientID = Recorder.ID;
      
              client.send(JSON.stringify(messObj));
      
            }//if

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
      
      if(Recorder.ID !== ws.GetID()){

        if(i === index){
  
          return ws;
    
        }//if

        i++;

      }//if
  
    }//for

  }//if
  
  return null;

}//WS_GetClientByID

WS_Server.WS_GetWSByID = function(ID){

  for (let ws of WS_Server.clients.values()) {
      
    if(ID === ws.GetID()){

      return ws;

    }//if

  }//for
  
  return null;

}//WS_GetWSByID

WS_Server.WS_GetNeighbors = function(ws){

  let previousWS = null;
  let nextWS = null;
  let stop = false;

  for (let item of WS_Server.clients.values()) {

    if(item.GetID() === ws.GetID()){

      stop = true;

    }//if
    else if(stop){

      nextWS = item;

      break;

    }//else if
    else{

      previousWS = item;
      
    }//else

  }//for

  return {'previousWS': previousWS, 'nextWS': nextWS};

}//WS_GetNeighbors

module.exports = WS_Port;