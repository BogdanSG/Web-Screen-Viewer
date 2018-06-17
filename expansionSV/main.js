'use strict';

const runtimePort = chrome.runtime.connect(); 

document.querySelector('#screen_button').onclick = () => {

  runtimePort.postMessage({'Start': true});

  window.close();

  //navigator.webkitGetUserMedia({ audio: true, video: false }, function(e) { console.log('1'); }, function(e) { console.log('0'); });
  
  //chrome.desktopCapture.chooseDesktopMedia(['screen', 'window', 'tab'], OnchooseDesktopMedia);

};

