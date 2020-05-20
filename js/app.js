
document.getElementById('connectButton').addEventListener('click', function() {

  switch (environmentSensor.connectionStatus)
  {
    case isDisconnected :
      environmentSensor.changeConnectionStatus(isConnected)
      environmentSensor.connect()
      .catch(error => {
        document.getElementById('errorLog').innerHTML = error
        console.log("error:" + error)
      });
      break;

    case isConnected :
      environmentSensor.changeConnectionStatus(isDisconnected)
      environmentSensor.disconnect(); 
      break;

    default :
    break;
  }
});


