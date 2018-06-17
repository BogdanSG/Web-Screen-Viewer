'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const peerConnectionConfig = {
    'iceServers': [
      {'urls': 'stun:stun.stunprotocol.org:3478'},
      {'urls': 'stun:stun.l.google.com:19302'},
    ]
  };

  let remoteVideo = document.getElementById('remoteVideo');

  let serverConnection = new WebSocket('ws://localhost:8888');

  let peerConnection;

  serverConnection.onmessage = message => {

    let messObj = JSON.parse(message.data);

    if(messObj.messageType === 'RTC-Connection'){

      peerConnection = createRTC(peerConnectionConfig);

      peerConnection.setRemoteDescription(new RTCSessionDescription(messObj.message)).then(() => {

        if(messObj.message.type == 'offer') {

            peerConnection.createAnswer().then(description => {  

              peerConnection.setLocalDescription(description).then(() => {

              serverConnection.send(JSON.stringify({'messageType' : 'RTC-Connection', 'message': peerConnection.localDescription}));

            }).catch(errorHandler);

          }).catch(errorHandler);

        }//if

      }).catch(errorHandler);

    }//if
    else if(messObj.messageType === 'RTC-ICE'){

      if(peerConnection){

        peerConnection.addIceCandidate(new RTCIceCandidate(messObj.message)).catch(errorHandler);

      }//if

    }//else if

  };//onmessage

});

function errorHandler(error) {

  console.log(error);

}//errorHandler

function createRTC(peerConnectionConfig){

  let peerConnection = new RTCPeerConnection(peerConnectionConfig);

  peerConnection.onicecandidate = event => { 

    if(event.candidate != null) {

      serverConnection.send(JSON.stringify({'ice': event.candidate}));

    }//if

  };//onicecandidate

  peerConnection.ontrack = event => {

    remoteVideo.srcObject = event.streams[0];

  };//ontrack

  return peerConnection;

}//createRTC