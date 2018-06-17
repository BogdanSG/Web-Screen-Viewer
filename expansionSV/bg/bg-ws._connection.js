'use strict';
  
function OnchooseDesktopMedia(sourceId, opts) {

    if(!serverConnection){

        serverConnection = new WebSocket('ws://localhost:8888');

        serverConnection.onmessage = message => {  
        
            let messObj = JSON.parse(message.data);
        
            if(messObj.messageType === 'RTC-Connection') {
        
                peerConnection.setRemoteDescription(new RTCSessionDescription(messObj.message)).catch(errorHandler);
        
            }//if
            else if(messObj.messageType === 'RTC-ICE') {
        
                peerConnection.addIceCandidate(new RTCIceCandidate(messObj.message)).catch(errorHandler);
        
            }//else if
        
        };//onmessage
    
        serverConnection.onclose = event => {
            serverConnection = null;
        };

    }//if

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
  
      navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(errorHandler);
  
    }//if
    else {
  
      console.log('Your browser does not support getUserMedia API');
      
    }//else
  
}//OnchooseDesktopMedia
  
function getUserMediaSuccess(stream) {
  
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
  
    peerConnection.addStream(stream);
  
    peerConnection.onicecandidate = event => {
  
      if(event.candidate != null) {
  
        serverConnection.send(JSON.stringify({'messageType': 'RTC-ICE', 'message': event.candidate}));
  
      }//if
  
    };
  
    peerConnection.createOffer().then(description => {
  
      peerConnection.setLocalDescription(description).then(() => {
  
        serverConnection.send(JSON.stringify({'messageType': 'RTC-Connection', 'message': peerConnection.localDescription}));
  
      }).catch(errorHandler);
  
    }).catch(errorHandler);
  
}//getUserMediaSuccess