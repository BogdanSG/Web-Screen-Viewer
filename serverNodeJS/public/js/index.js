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

  serverConnection.onmessage = message => {

    let signal = JSON.parse(message.data);

    if(signal.sdp) {

      peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {

        if(signal.sdp.type == 'offer') {

            peerConnection.createAnswer().then(description => {  

              peerConnection.setLocalDescription(description).then(() => {

              serverConnection.send(JSON.stringify({'sdp': peerConnection.localDescription}));

            }).catch(errorHandler);

          }).catch(errorHandler);

        }//if

      }).catch(errorHandler);

    }//if
    else if(signal.ice) {

      peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);

    }//else if

  };//onmessage

  let peerConnection = new RTCPeerConnection(peerConnectionConfig);

  peerConnection.onicecandidate = event => { 

    if(event.candidate != null) {

      serverConnection.send(JSON.stringify({'ice': event.candidate}));

    }//if

  };//onicecandidate

  peerConnection.ontrack = event => {

    remoteVideo.srcObject = event.streams[0];

  };//ontrack


});

function errorHandler(error) {

  console.log(error);

}//errorHandler