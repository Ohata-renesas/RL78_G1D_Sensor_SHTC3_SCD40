const CALIBRATION_NO        = 0;
const CALIBRATION_YES       = 1;
const dataMaxLength         = 10;
const maxNumberOfSensor     = 3;
const maxNumberOfRepetition = 15;
const mathPI                = Math.PI;
const startAngle            = mathPI / 2;
const renesasBlue           = "blue";
const renesasGray           = "dimgray";
let sensorInfo = {
  temperature     : {sensorID : 0,
                     maxValue : 100,
                     minValue : 0, 
                     values   : new Array(dataMaxLength),
                     text     : {name  : "Temperature", 
                                 value : "000.00", 
                                 unit  : "[°C]"}},
  humidity        : {sensorID : 1, 
                     maxValue : 100,    
                     minValue : 0, 
                     values   : new Array(dataMaxLength), 
                     text     : {name  : "Humidity", 
                                 value : "000.00", 
                                 unit  : "[%RH]"}},
  co2             : {sensorID : 2, 
                     maxValue : 10000,  
                     minValue : 0, 
                     values   : new Array(dataMaxLength), 
                     text     : {name  : "CO2", 
                                 value : "00000", 
                                 unit  : "[ppm]"}},
  calibration     : 0,
  dataIsChanged   : 1,
};
let connectButton     = document.getElementById('connectButton');
let bgCanvas          = document.getElementById('backgroundCanvas');
let fgCanvas          = document.getElementById('foregroundCanvas');
let bgContext         = bgCanvas.getContext('2d');
let fgContext         = fgCanvas.getContext('2d');
let graphMode         = 'meter';
let dataPosition      = 0;
let oldEndAngle       = new Array(maxNumberOfSensor).fill(startAngle);
let currentEndAngle   = new Array(maxNumberOfSensor).fill(startAngle);
let countOfRepetition = 0;
let requestID         = null;


/* Initial drawing */
redrawAllCanvas();

/* Backgroud Canvas */
// Draw background canvas
function drawBgCanvas() {
  bgCanvas  = updateWidthAndHeightOfCanvas(bgCanvas);
  bgContext = bgCanvas.getContext('2d');
  drawCanvas.clearCanvas(bgContext, bgCanvas.width, bgCanvas.height);
  drawBgGraph(bgContext, bgCanvas.width, bgCanvas.height);
}

// Draw background graph
function drawBgGraph(context, width, height) {
  if (graphMode === 'meter') {
    calculateCoordinates(context, width, height, drawBgMeterGraph);
  }
  else {
    drawBgLineGraph(context, width, height);
  }
}

// Draw background meter graph
function drawBgMeterGraph(id, context, x0, y0, radius) {
  drawBgCircle(context, x0, y0, radius);
  drawBgText(id, context, x0, y0, radius);
}

// Draw background circle
function drawBgCircle(context, x0, y0, radius) {
  context.lineWidth   = radius / 30;
  context.strokeStyle = renesasGray;
  drawCanvas.drawCircle(context, x0, y0, radius);
}

// Draw background text
function drawBgText(id, context, x0, y0, radius) {
  let fontSizeOfName     = String(Math.round(radius / 6));
  let fontSizeOfValue    = String(Math.round(radius / 3));
  let fontSizeOfUnit     = String(Math.round(radius / 6));
  let yCoordinateOfName  = y0 - radius / 3 + parseInt(fontSizeOfName)  / 2;
  let yCoordinateOfValue = y0              + parseInt(fontSizeOfValue) / 2;
  let yCoordinateOfUnit  = y0 + radius / 3 + parseInt(fontSizeOfUnit)  / 2;

  context.textAlign = "center";
  context.fillStyle = renesasGray;

  switch(id) {
    case sensorInfo.temperature.sensorID :
      drawCanvas.drawText(context, sensorInfo.temperature.text.name,  x0, yCoordinateOfName,  fontSizeOfName);
      drawCanvas.drawText(context, sensorInfo.temperature.text.value, x0, yCoordinateOfValue, fontSizeOfValue);
      drawCanvas.drawText(context, sensorInfo.temperature.text.unit,  x0, yCoordinateOfUnit,  fontSizeOfUnit);
    break;

    case sensorInfo.humidity.sensorID :
      drawCanvas.drawText(context, sensorInfo.humidity.text.name,  x0, yCoordinateOfName,  fontSizeOfName);
      drawCanvas.drawText(context, sensorInfo.humidity.text.value, x0, yCoordinateOfValue, fontSizeOfValue);
      drawCanvas.drawText(context, sensorInfo.humidity.text.unit,  x0, yCoordinateOfUnit,  fontSizeOfUnit);
    break;

    case sensorInfo.co2.sensorID :
      drawCanvas.drawText(context, sensorInfo.co2.text.name,  x0, yCoordinateOfName,  fontSizeOfName);
      drawCanvas.drawText(context, sensorInfo.co2.text.value, x0, yCoordinateOfValue, fontSizeOfValue);
      drawCanvas.drawText(context, sensorInfo.co2.text.unit,  x0, yCoordinateOfUnit,  fontSizeOfUnit);
    break;

    default :
    break;
  }
}

/* Foreground Canvas */
// Draw foreground canvas
function drawFgCanvas() {
  fgCanvas   = updateWidthAndHeightOfCanvas(fgCanvas);
  fgContext  = fgCanvas.getContext('2d');

  for (let step = 0; step < maxNumberOfSensor; step++) {
    currentEndAngle[step] = startAngle + convertValueToAngle(step);
  }
  countOfRepetition = 0;
  drawFgGraph();
}

// Draw foreground graph
function drawFgGraph() {
  drawCanvas.clearCanvas(fgContext, fgCanvas.width, fgCanvas.height);
  
  if (graphMode === 'meter') {
    calculateCoordinates(fgContext, fgCanvas.width, fgCanvas.height, drawFgMeterGraph);
  }
  else {
    drawFgLineGraph(fgContext, fgCanvas.width, fgCanvas.height);
  }

  if (countOfRepetition < maxNumberOfRepetition) {
    countOfRepetition++;
    requestID = requestAnimationFrame(drawFgGraph);
  }
  else {
    countOfRepetition = 0;
    for (let step = 0; step < maxNumberOfSensor; step++) {
      oldEndAngle[step] = currentEndAngle[step];
    }
    cancelAnimationFrame(requestID);
  }  
}


// Draw foreground meter graph
function drawFgMeterGraph(id, context, x0, y0, radius) {
  let rangeOfAngle    = (currentEndAngle[id] - oldEndAngle[id]) / maxNumberOfRepetition;
  radius             *= 0.85;
  context.lineWidth   = radius / 10;
  context.strokeStyle = renesasBlue;
  drawCanvas.drawArc(context, x0, y0, radius, startAngle, oldEndAngle[id] + rangeOfAngle * (countOfRepetition + 1));
}

// Convert sensor value to angle
function convertValueToAngle(id) {

  switch (id) {
    case sensorInfo.temperature.sensorID :
      return calculateAngle(parseFloat(sensorInfo.temperature.text.value),
                                       sensorInfo.temperature.maxValue,
                                       sensorInfo.temperature.minValue);

    case sensorInfo.humidity.sensorID :
      return calculateAngle(parseFloat(sensorInfo.humidity.text.value),
                                       sensorInfo.humidity.maxValue,
                                       sensorInfo.humidity.minValue);

    case sensorInfo.co2.sensorID :
      return calculateAngle(parseInt(sensorInfo.co2.text.value),
                                     sensorInfo.co2.maxValue,
                                     sensorInfo.co2.minValue);

    default :
      return 0;
  }
}

/* Calculate angle using sensor value */
function calculateAngle(currentValue, maxValue, minValue) {
  if      (currentValue === undefined)  return 0;  
  else if (currentValue >= maxValue)    return 2 * mathPI;
  else if (currentValue <= minValue)    return 0;
  else                                  return (currentValue - minValue) * 2 * mathPI / (maxValue - minValue);
}

 /* Update width and height of canvas */
function updateWidthAndHeightOfCanvas(canvas) {
  canvas.width  = drawCanvas.getWidth(canvas);
  canvas.height = drawCanvas.getHeight(canvas);
  return canvas;
}

/* Calculate coordinates and call a function */
function calculateCoordinates(context, width, height, func) {
  let heightIsLonger = (width <= height) ? 1 : 0;
  let margin;
  let x0;
  let y0;
  let radius;

  if (heightIsLonger) {
    radius = height / 8;
    margin = radius / 2;
    x0     = width / 2;
    y0     = 0;

    for (let step = 0; step < maxNumberOfSensor; step++) {
      y0 += (margin + radius);
      func(step, context, x0, y0, radius);
      y0 += radius;
    }
  }
  else {
    radius = width / 8;
    margin = radius / 2;
    x0     = 0;
    y0     = height / 2;

    for (let step = 0; step < maxNumberOfSensor; step++) {
      x0 += (margin + radius);
      func(step, context, x0, y0, radius);
      x0 += radius;
    }
  }
}

/* Click connect button */
connectButton.addEventListener('click', function() {

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
    redrawAllCanvas();
  }
  else {
    // nothing
  }

  switch (result.calibration) {
    case CALIBRATION_NO :
      document.getElementById('statusText').innerHTML = "Measurement";
    break;

    case CALIBRATION_YES :
      document.getElementById('statusText').innerHTML = "Calibration";
    break;

    default :
      document.getElementById('statusText').innerHTML = "Calibration Data Error";
    break;
  }
}

/* Set sensor value */
function setSensorValue(data) {
  // set value
  sensorInfo.temperature.values[dataPosition]   = data.temperatureValue;
  sensorInfo.humidity.values[dataPosition]      = data.humidityValue;
  sensorInfo.co2.values[dataPosition]           = data.co2Value;
  if (dataPosition < (dataMaxLength - 1)) {
    dataPosition++;
  }
  else {
    dataPosition = 0;
  }
  // set text
  sensorInfo.temperature.text.value = String(data.temperatureValue);
  sensorInfo.humidity.text.value    = String(data.humidityValue);
  sensorInfo.co2.text.value         = String(data.co2Value); 
}


// /* Click canvas */
// canvas.addEventListener('click', event => {
//   graphMode = graphMode === 'meter' ? 'line' : 'meter';
//   drawSensorData();
// });

/* Resize window */
window.onresize = redrawAllCanvas;

/* Change visibility */ 
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    redrawAllCanvas();
  }
});

function redrawAllCanvas() {
  drawBgCanvas();
  drawFgCanvas();
}