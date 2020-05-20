
document.getElementById('connectButton').addEventListener('click', function() {

  switch (environmentSensor.connectionStatus)
  {
    case DISCONNECT :
      environmentSensor.connect()
      .then(_ => {
        environmentSensor.changeConnectionStatus(CONNECT)
        document.getElementById('statusText').innerHTML = "Measurement"
        environmentSensor.characteristic.addEventListener('characteristicvaluechanged', event => {
          let result = this.parseSensorData(event.target.value)
        })
      })
      .catch(error => {
        document.getElementById('statusText').innerHTML = error
        console.log("error:" + error)
      });
      break;

    case CONNECT :
      environmentSensor.disconnect(); 
      break;

    default :
    break;
  }
});


