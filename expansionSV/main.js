'use strict';

const peerConnectionConfig = {
  'iceServers': [
    {'urls': 'stun:stun.stunprotocol.org:3478'},
    {'urls': 'stun:stun.l.google.com:19302'},
  ]
};

const serverConnection = new WebSocket('ws://localhost:8888');

let peerConnection;

serverConnection.onmessage = message => {  
  
  let signal = JSON.parse(message.data);

  if(signal.sdp) {

    peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).catch(errorHandler);

  }//if
  else if(signal.ice) {

    peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);

  }//else if

};//onmessage

function OnchooseDesktopMedia(sourceId, opts) {

  // var constraints = {
  //   video: true,
  //   audio: true,
  // };

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

      serverConnection.send(JSON.stringify({'ice': event.candidate}));

    }//if

  };

  peerConnection.createOffer().then(description => {

    peerConnection.setLocalDescription(description).then(() => {

      serverConnection.send(JSON.stringify({'sdp': peerConnection.localDescription}));

    }).catch(errorHandler);

  }).catch(errorHandler);

}//getUserMediaSuccess

function errorHandler(error) {

  console.log(error);

}//errorHandler

document.querySelector('#screen_button').onclick = () => {

    //navigator.webkitGetUserMedia({ audio: true, video: false }, function(e) { console.log('1'); }, function(e) { console.log('0'); });

    chrome.desktopCapture.chooseDesktopMedia(['screen', 'window', 'tab'], OnchooseDesktopMedia);

};

