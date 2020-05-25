'use strict';


const installButton = document.getElementById('butInstall');
let deferredInstallPrompt = null;

installButton.addEventListener('click', installPWA);
window.addEventListener('beforeinstallprompt', saveBeforeInstallPromptEvent);

function saveBeforeInstallPromptEvent(event) {
  deferredInstallPrompt = event;
  installButton.removeAttribute('hidden');
}


function installPWA(event) {
  deferredInstallPrompt.prompt();
  event.srcElement.setAttribute('hidden', true);

  deferredInstallPrompt.userChoice
  .then((choice) => {
      if (choice.outcome === 'accepted') {
          console.log("User accepted the A2HS prompt", choice);
      }
      else {
          console.log("User dismissed the A2HS prompt", choice);
      }
      deferredInstallPrompt = null;
  });
}

window.addEventListener('appinstalled', logAppInstalled);

function logAppInstalled(event) {
  console.log("App was installed.", event);
}
