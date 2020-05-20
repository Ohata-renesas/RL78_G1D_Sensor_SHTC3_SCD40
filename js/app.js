
document.getElementById('connectButton').addEventListener('click', function() {

  switch (environmentSensor.connectionStatus)
  {
    case isDisconnected :
      environmentSensor.connect()
      .catch(error => {
        document.getElementById('errorLog').innerHTML = error
        console.log("error:" + error)
      });
      break;

    case isConnected :
      environmentSensor.disconnect(); 
      break;

    default :
    break;
  }
});


