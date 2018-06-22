'use strict';

var peerConnectionConfig = {
  'iceServers': [
    {'urls': 'stun:stun.stunprotocol.org:3478'},
    {'urls': 'stun:stun.l.google.com:19302'},
  ]
};

var serverConnection;
var peerConnection;
var stream;
var ClientID;

function errorHandler(error) {

  console.log(error);

}//errorHandler