'use strict';

let ClientID = null;
let stream = null;

document.addEventListener('DOMContentLoaded', () => {

  let peerConnectionConfig = {
    'iceServers': [
      {'urls': 'stun:stun.stunprotocol.org:3478'},
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'stun:stun1.l.google.com:19302'},
      {'urls': 'stun:stun2.l.google.com:19302'},
      {'urls': 'stun:stun3.l.google.com:19302'},
      {'urls': 'stun:stun4.l.google.com:19302'},
      {
        'urls': 'turn:192.158.29.39:3478?transport=udp',
        'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        'username': '28224511:1379330808'
      },
      {
        'urls': 'turn:192.158.29.39:3478?transport=tcp',
        'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        'username': '28224511:1379330808'
      }
    ]
  };

  let remoteVideo = document.getElementById('remoteVideo');

  let serverConnection = new WebSocket(`ws://${window.location.hostname}:8888`);

  let peerConnectionPrev;

  let peerConnectionNext;

  function WS_onmessage(message){

    let messObj = JSON.parse(message.data);

    ClientID = messObj.ClientID;
    
    if(messObj.messageType === 'ReConnect'){

      setTimeout(() => {

        serverConnection = new WebSocket(`ws://${window.location.hostname}:8888`);

        serverConnection.onmessage = WS_onmessage;

      }, messObj.message);

    }//if
    else if(messObj.messageType === 'Send-RTC'){

      peerConnectionNext = new RTCPeerConnection(peerConnectionConfig);

      peerConnectionNext.addStream(stream);
    
      peerConnectionNext.onicecandidate = event => {
    
        if(event.candidate != null) {
    
          serverConnection.send(JSON.stringify({'messageType': 'RTC-ICE', 'message': event.candidate, 'ClientID': ClientID, 'Queue': 'Prev'}));
    
        }//if
    
      };
    
      peerConnectionNext.createOffer().then(description => {
    
        peerConnectionNext.setLocalDescription(description).then(() => {
    
          serverConnection.send(JSON.stringify({'messageType': 'RTC-Connection', 'message': peerConnectionNext.localDescription, 'ClientID': ClientID, 'Queue': 'Prev'}));
    
        }).catch(errorHandler);
    
      }).catch(errorHandler);

    }//if
    else if(messObj.messageType === 'RTC-Connection'){

      if(messObj.Queue === 'Prev'){

        peerConnectionPrev = createRTC(peerConnectionConfig, serverConnection);

        peerConnectionPrev.setRemoteDescription(new RTCSessionDescription(messObj.message)).then(() => {
  
          if(messObj.message.type == 'offer') {
  
            peerConnectionPrev.createAnswer().then(description => {  
  
              peerConnectionPrev.setLocalDescription(description).then(() => {
  
                serverConnection.send(JSON.stringify({'messageType' : 'RTC-Connection', 'message': peerConnectionPrev.localDescription, 'ClientID': ClientID, 'Queue': 'Next'}));
  
              }).catch(errorHandler);
  
            }).catch(errorHandler);
  
          }//if
  
        }).catch(errorHandler);

      }//if
      else if(messObj.Queue === 'Next'){

        peerConnectionNext.setRemoteDescription(new RTCSessionDescription(messObj.message)).catch(errorHandler);

      }//else if

    }//if
    else if(messObj.messageType === 'RTC-ICE'){

      if(peerConnectionPrev && messObj.Queue === 'Prev'){

        peerConnectionPrev.addIceCandidate(new RTCIceCandidate(messObj.message)).catch(errorHandler);

      }//if
      else if(peerConnectionNext && messObj.Queue === 'Next'){

        peerConnectionNext.addIceCandidate(new RTCIceCandidate(messObj.message)).catch(errorHandler);

      }//else if

    }//else if

  };//onmessage

  serverConnection.onmessage = WS_onmessage;

  // remoteVideo.addEventListener('playing', () => {

  //   if(serverConnection){
  
  //     console.log('playing');

  //     //serverConnection.send(JSON.stringify({'messageType': 'Play-OK', 'message': ''}));
  
  //   }//if
  
  // });

});

function errorHandler(error) {

  console.log(error);

}//errorHandler

function createRTC(peerConnectionConfig, serverConnection){

  let peerConnection = new RTCPeerConnection(peerConnectionConfig);

  peerConnection.onicecandidate = event => { 

    if(event.candidate != null) {

      serverConnection.send(JSON.stringify({'messageType': 'RTC-ICE', 'message': event.candidate, 'ClientID': ClientID , 'Queue': 'Next'}));

    }//if

  };//onicecandidate

  peerConnection.ontrack = event => {

    stream = event.streams[0];

    remoteVideo.srcObject = stream;

  };//ontrack

  return peerConnection;

}//createRTC