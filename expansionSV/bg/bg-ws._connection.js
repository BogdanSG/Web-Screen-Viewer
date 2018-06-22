'use strict';
  
function OnchooseDesktopMedia(sourceId, opts) {

  function Initialization(){

    const constraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSourceId: sourceId,
          chromeMediaSource: 'desktop',
          maxWidth: window.screen.width,
          maxHeight: window.screen.height
        },
        optional: []
      }
    };
  
    if(navigator.mediaDevices.getUserMedia) {
  
      navigator.mediaDevices.getUserMedia(constraints).then(s => {stream = s;}).catch(errorHandler);
  
    }//if
    else {
  
      console.log('Your browser does not support getUserMedia API');
      
    }//else

  }//Initialization

    if(!serverConnection){

        serverConnection = new WebSocket('ws://localhost:8888');

        serverConnection.onmessage = message => {  
        
            let messObj = JSON.parse(message.data);

            ClientID = messObj.ClientID;
        
            if(messObj.messageType === 'Send-RTC'){

              peerConnection = new RTCPeerConnection(peerConnectionConfig);
  
              peerConnection.addStream(stream);
            
              peerConnection.onicecandidate = event => {
            
                if(event.candidate != null) {
            
                  serverConnection.send(JSON.stringify({'messageType': 'RTC-ICE', 'message': event.candidate, 'ClientID': ClientID}));
            
                }//if
            
              };
            
              peerConnection.createOffer().then(description => {
            
                peerConnection.setLocalDescription(description).then(() => {
            
                  serverConnection.send(JSON.stringify({'messageType': 'RTC-Connection', 'message': peerConnection.localDescription, 'ClientID': ClientID}));
            
                }).catch(errorHandler);
            
              }).catch(errorHandler);

            }//if
            else if(messObj.messageType === 'RTC-Connection') {
        
                peerConnection.setRemoteDescription(new RTCSessionDescription(messObj.message)).catch(errorHandler);
        
            }//if
            else if(messObj.messageType === 'RTC-ICE') {
        
                peerConnection.addIceCandidate(new RTCIceCandidate(messObj.message)).catch(errorHandler);
        
            }//else if
        
        };//onmessage
    
        serverConnection.onclose = event => {
            serverConnection = null;
        };

        serverConnection.onopen = () => {

          serverConnection.send(JSON.stringify({'messageType': 'Recorder', 'message': ''}));

          Initialization();

        };

    }//if
    else{

      Initialization();

    }//else

    serverConnection.send(JSON.stringify({'messageType': 'Stream-Start', 'message': ''}));
  
}//OnchooseDesktopMedia