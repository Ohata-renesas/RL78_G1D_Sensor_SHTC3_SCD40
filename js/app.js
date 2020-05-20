let button = document.getElementById('connectButton')
let canvas = document.getElementById('sensorData')
let temperatureData = []
let humidityData    = []
let co2Data         = []
let mode            = 'meter';

button.addEventListener('click', function() {

  switch (environmentSensor.connectionStatus)
  {
    case sensorIsDisconnected :
      environmentSensor.connect()
      .then(_ => {
        environmentSensor.changeConnectionStatus(sensorIsConnected)
        document.getElementById('statusText').innerHTML = "Measurement"
        environmentSensor.characteristic.addEventListener('characteristicvaluechanged', event => {
          let result = environmentSensor.parseSensorData(event.target.value)
          temperatureData.put(result.temperatureData)
          humidityData.put(result.humidityData)
          co2Data.put(result.co2Data)
          drawSensorData();
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


// canvas.addEventListener('click', event => {
//   mode = mode === 'meter' ? 'line' : 'meter';
//   drawSensorData();
// });


function drawSensorData() {
  requestAnimationFrame(() => {
    canvas.width = parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
    canvas.height = parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;

    let context = canvas.getContext('2d');
    let margin = 2;
    let max = Math.max(0, Math.round(canvas.width / 11));
    let offset = Math.max(0, temperatureData.length - max);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#00796B';

    if (mode === 'meter')
    {
      for (var i = 0; i < Math.max(temperatureData.length, max); i++) {
        var barHeight = Math.round(temperatureData[i + offset ] * canvas.height / 200);
        context.rect(11 * i + margin, canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
        context.stroke();
      }
    }
  });
}

window.onresize = drawSensorData;

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    drawSensorData();
  }
});