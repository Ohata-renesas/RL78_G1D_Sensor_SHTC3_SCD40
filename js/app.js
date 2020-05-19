
document.getElementById('connectButton').addEventListener('click', function() {

  switch (environmentSensor.connectionStatus)
  {
    case isDisconnected :
      document.getElementById('connectButton').innerHTML = "DISCONNECT"
      environmentSensor.changeConnectionStatus(isConnected)
      environmentSensor.connect()
      .catch(error => {
        console.log("error:" + error)
      });
      break;

    case isConnected :
      document.getElementById('connectButton').innerHTML = "CONNECT"
      environmentSensor.changeConnectionStatus(isDisconnected)
      environmentSensor.disconnect(); 
      break;

    default :
    break;
  }
});


