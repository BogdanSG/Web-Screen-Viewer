'use strict';

chrome.runtime.onConnect.addListener(port => {

    port.onMessage.addListener(message => {

        if(message.Start){

            chrome.desktopCapture.chooseDesktopMedia(['screen', 'window', 'tab'], OnchooseDesktopMedia);

        }//if

    });

});