const dataMaxLength  = 10;
const numberOfSensor = 3;
const mathPI = Math.PI;
let sensorInfo = {
  temperature     : {sensorID : 0,
                     maxValue : 100,
                     minValue : 0, 
                     values   : new Array(dataMaxLength),
                     text     : {name  : "Temperature", 
                                 value : "000.00", 
                                 unit  : "°C"}},
  humidity        : {sensorID : 1, 
                     maxValue : 100,    
                     minValue : 0, 
                     values   : new Array(dataMaxLength), 
                     text     : {name  : "Humidity", 
                                 value : "000.00", 
                                 unit  : "%RH"}},
  co2             : {sensorID : 2, 
                     maxValue : 10000,  
                     minValue : 0, 
                     values   : new Array(dataMaxLength), 
                     text     : {name  : "CO2", 
                                 value : "00000", 
                                 unit  : "ppm"}},
  calibration     : 0,
  dataIsChanged   : 1,
};
let button            = document.getElementById('connectButton');
let canvas            = document.getElementById('sensorData');
let graphMode         = 'meter';
let dataPosition      = 0;


/* Initial drawing */
 drawSensorData();

/* Click connect button */
button.addEventListener('click', function() {

  if (!environmentSensor.isConnected()) {
    dataPosition = 0;
    environmentSensor.connect()
    .then(_ => {    
      environmentSensor.changeConnectionStatus();
      environmentSensor.characteristic.addEventListener('characteristicvaluechanged', handleEnvironmentSensor);
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

/* Handle environment sensor */
function handleEnvironmentSensor(event) {
  let result = environmentSensor.parseSensorData(event.target.value);

  if (sensorInfo.dataIsChanged != result.dataIsChanged) {
    sensorInfo.dataIsChanged = result.dataIsChanged;
    setSensorValue(result);
    drawSensorData();

    if (dataPosition < (dataMaxLength - 1)) {
      dataPosition++;
    }
    else {
      dataPosition = 0;
    }
  }
  else {
    // nothing
  }
}

/* Set sensor value */
function setSensorValue(data) {
  // set value
  sensorInfo.temperature.values[dataPosition]   = data.temperatureValue;
  sensorInfo.humidity.values[dataPosition]      = data.humidityValue;
  sensorInfo.co2.values[dataPosition]           = data.co2Value;
  // set text
  sensorInfo.temperature.text.value = String(data.temperatureValue);
  sensorInfo.humidity.text.value    = String(data.humidityValue);
  sensorInfo.co2.text.value         = String(data.co2Value);
}

/* Draw Sensor Data */
function drawSensorData() {
  requestAnimationFrame(() => {

    console.log(dataPosition);
    console.log(sensorInfo.temperature.values[dataPosition]);

    //CanvasのWidthとHeightを取得
    canvas.width  = drawCanvas.getWidth(canvas);
    canvas.height = drawCanvas.getHeight(canvas);

    let context = canvas.getContext('2d');
    context.fillStyle = "orange";
    context.textAlign = "center";

    // クリア
    drawCanvas.clearAllFigure(context, canvas.width, canvas.height);

    if (graphMode === 'meter') {
      drawMeterGraph(context, canvas.width, canvas.height);
    }
    else {
      drawLineGraph(context, canvas.width, canvas.height);
    }
  });
}

/* Draw meter graph */
function drawMeterGraph(context, width, height) {
  let heightIsLonger = (width <= height) ? 1 : 0;
  let margin;
  let radiusOfCircle;
  let radiusOfArc;
  let x0;
  let y0;
  let startAngle = mathPI / 2;

  if (heightIsLonger) {
    radiusOfCircle  = height / 8;
    radiusOfArc     = radiusOfCircle * 0.8;
    margin          = radiusOfCircle / 2;
    x0              = width / 2;
    y0              = 0;

    // draw circle and arc
    for (step = 0; step < numberOfSensor; step++) {
      y0 += (margin + radiusOfCircle);
      drawCanvas.drawCircle(context, x0, y0, radiusOfCircle);
      drawCanvas.drawArc(context, x0, y0, radiusOfArc, startAngle, startAngle + convertValueToAngle(step));
      drawSensorText(step, context, x0, y0, radiusOfCircle);
      y0 += radiusOfCircle;
    }
  }
  else {
    radiusOfCircle  = width / 8;
    radiusOfArc     = radiusOfCircle * 0.8;
    margin          = radiusOfCircle / 2;
    x0              = 0;
    y0              = height / 2;

    // draw circle and arc
    for (step = 0; step < numberOfSensor; step++) {
      x0 += (margin + radiusOfCircle);
      drawCanvas.drawCircle(context, x0, y0, radiusOfCircle);
      drawCanvas.drawArc(context, x0, y0, radiusOfArc, startAngle, startAngle + convertValueToAngle(step));
      drawSensorText(step, context, x0, y0, radiusOfCircle);
      x0 += radiusOfCircle;
    }
  }
}

function drawSensorText(id, context, x, y, radius) {
  let fontSizeOfName     = String(Math.round(radius / 6));
  let fontSizeOfValue    = String(Math.round(radius / 4));
  let fontSizeOfUnit     = String(Math.round(radius / 6));
  let yCoordinateOfName  = y - radius / 2 + parseInt(fontSizeOfName) / 2;
  let yCoordinateOfValue = y + parseInt(fontSizeOfValue) / 2;
  let yCoordinateOfUnit  = y + radius / 2 + parseInt(fontSizeOfUnit) / 2;

  switch(id) {
    case sensorInfo.temperature.sensorID :
      drawCanvas.drawText(context, sensorInfo.temperature.text.name,  x, yCoordinateOfName,  fontSizeOfName);
      drawCanvas.drawText(context, sensorInfo.temperature.text.value, x, yCoordinateOfValue, fontSizeOfValue);
      drawCanvas.drawText(context, sensorInfo.temperature.text.unit,  x, yCoordinateOfUnit,  fontSizeOfUnit);
    break;

    case sensorInfo.humidity.sensorID :
      drawCanvas.drawText(context, sensorInfo.humidity.text.name,  x, yCoordinateOfName,  fontSizeOfName);
      drawCanvas.drawText(context, sensorInfo.humidity.text.value, x, yCoordinateOfValue, fontSizeOfValue);
      drawCanvas.drawText(context, sensorInfo.humidity.text.unit,  x, yCoordinateOfUnit,  fontSizeOfUnit);
    break;

    case sensorInfo.co2.sensorID :
      drawCanvas.drawText(context, sensorInfo.co2.text.name,  x, yCoordinateOfName,  fontSizeOfName);
      drawCanvas.drawText(context, sensorInfo.co2.text.value, x, yCoordinateOfValue, fontSizeOfValue);
      drawCanvas.drawText(context, sensorInfo.co2.text.unit,  x, yCoordinateOfUnit,  fontSizeOfUnit);
    break;

    default :
    break;
  }
}

/* Convert sensor value to angle */
function convertValueToAngle(id) {
  let angle;

  switch (id) {
    case sensorInfo.temperature.sensorID :
      angle = calculateAngle(sensorInfo.temperature.values[dataPosition],
                             sensorInfo.temperature.maxValue,
                             sensorInfo.temperature.minValue);
    break;

    case sensorInfo.humidity.sensorID :
      angle = calculateAngle(sensorInfo.humidity.values[dataPosition],
                             sensorInfo.humidity.maxValue,
                             sensorInfo.humidity.minValue);
    break;

    case sensorInfo.co2.sensorID :
      angle = calculateAngle(sensorInfo.co2.values[dataPosition],
                             sensorInfo.co2.maxValue,
                             sensorInfo.co2.minValue);
    break;

    default :
      angle = 0;
    break;
  }
  return angle;
}

/* Calculate angle using sensor value */
function calculateAngle(currentValue, maxValue, minValue) {
  if      (currentValue === undefined)  return 0;  
  else if (currentValue >= maxValue)    return 2 * mathPI;
  else if (currentValue <= minValue)    return 0;
  else                                  return (currentValue - minValue) * 2 * mathPI / (maxValue - minValue);
}

/* Draw line graph */
function drawLineGraph(width, height) {
  // ここから！
}


// /* Click canvas */
// canvas.addEventListener('click', event => {
//   graphMode = graphMode === 'meter' ? 'line' : 'meter';
//   drawSensorData();
// });

/* Resize window */
window.onresize = drawSensorData;

/* Change visibility */ 
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    drawSensorData();
  }
});