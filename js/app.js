
document.getElementById('connectButton').addEventListener('click', function() {

  switch (environmentSensor.connectionStatus)
  {
    case sensorIsDisconnected :
      environmentSensor.connect()
      .then(_ => {
        environmentSensor.changeConnectionStatus(sensorIsConnected)
        document.getElementById('statusText').innerHTML = "Measurement"
        environmentSensor.characteristic.addEventListener('characteristicvaluechanged', event => {
          let result = environmentSensor.parseSensorData(event.target.value)
        })
      })
      .catch(error => {
        document.getElementById('statusText').innerHTML = error
        console.log("error:" + error)
      });
      break;

    case sensorIsConnected :
      environmentSensor.disconnect(); 
      break;

    default :
    break;
  }
});


