let button = document.getElementById('connectButton')
let canvas = document.getElementById('sensorData')
let temperatureData = []
let humidityData    = []
let co2Data         = []
let mode            = 'meter';

button.addEventListener('click', function() {

  if (!environmentSensor.isConnected()) {
    environmentSensor.connect()
    .then(_ => {    
      environmentSensor.changeConnectionStatus();
      environmentSensor.characteristic.addEventListener('characteristicvaluechanged', event => {
        let result = environmentSensor.parseSensorData(event.target.value);
        temperatureData.push(result.temperatureData);
        humidityData.push(result.humidityData);
        co2Data.push(result.co2Data);
        drawSensorData();
      })
    })
    .catch(error => {
      document.getElementById('statusText').innerHTML = error;
      console.log("error:" + error);
    });
  } 
  else {
    environmentSensor.disconnect(); 
  }
});


// canvas.addEventListener('click', event => {
//   mode = mode === 'meter' ? 'line' : 'meter';
//   drawSensorData();
// });


function drawSensorData() {
  requestAnimationFrame(() => {

    console.log(getComputedStyle(canvas).width)
    console.log(getComputedStyle(canvas).width.slice(0, -2))
    console.log(getComputedStyle(canvas).height)
    console.log(getComputedStyle(canvas).height.slice(0, -2))

    console.log(devicePixelRatio)

    canvas.width = parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
    canvas.height = parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;

    console.log(canvas.width + "px");
    console.log(canvas.height + "px");

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