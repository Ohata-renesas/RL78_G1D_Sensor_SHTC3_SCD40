const isInMeasurement       = 0;
const isInCalibration       = 1;
const isI2cError            = 2;
const isDataError           = 3;
const maxDataLength         = 30;
const maxNumberOfSensor     = 3;
const maxNumberOfRepetition = 15;
const mathPI                = Math.PI;
const startAngle            = mathPI / 2;
const renesasBlue           = "#2A289D";
const renesasGray           = "#333333";
const sensirionGreen        = "#66CC33";
let sensorInfo = {
  temperature     : {sensorID : 0,
                     maxValue : 100,
                     minValue : 0, 
                     values   : new Array(maxDataLength).fill(null),
                     text     : {name  : "Temperature", 
                                 value : "000.00", 
                                 unit  : "[°C]"}},
  humidity        : {sensorID : 1, 
                     maxValue : 100,    
                     minValue : 0,
                     values   : new Array(maxDataLength).fill(null), 
                     text     : {name  : "Humidity", 
                                 value : "000.00", 
                                 unit  : "[%RH]"}},
  co2             : {sensorID : 2, 
                     maxValue : 10000,  
                     minValue : 0,
                     values   : new Array(maxDataLength).fill(null), 
                     text     : {name  : "CO2", 
                                 value : "00000", 
                                 unit  : "[ppm]"}},
  statusData      : isInMeasurement,
  dataIsChanged   : null,
};

let connectButton       = document.getElementById('connectButton');
let statusText          = document.getElementById('statusText');
let statusTextStyle     = statusText.style;
let bgCanvas            = document.getElementById('backgroundCanvas');
let fgCanvas            = document.getElementById('foregroundCanvas');
let bgContext           = bgCanvas.getContext('2d');
let fgContext           = fgCanvas.getContext('2d');
let graphMode           = 'meter';
let countOfData         = 0;
let oldEndAngle         = new Array(maxNumberOfSensor).fill(startAngle);
let currentEndAngle     = new Array(maxNumberOfSensor).fill(startAngle);
let countOfRepetition   = 0;
let requestID           = null;

/** Click connect button event */
const clickConnectButton = () => {
  if (!environmentalSensor.isConnected()) {
    connectButton.removeEventListener('click', clickConnectButton);
    initializationProcess();    
    environmentalSensor.connect()
    .then(_ => {    
      connectButton.addEventListener('click', clickConnectButton);
      environmentalSensor.changeConnectionStatus();
      environmentalSensor.characteristic.addEventListener('characteristicvaluechanged', handleenvironmentalSensor);
    })
    .catch(error => {
      connectButton.addEventListener('click', clickConnectButton);
      statusText.innerHTML = error;
      console.log("error:" + error);
    });
  } 
  else {
    connectButton.removeEventListener('click', clickConnectButton);
    environmentalSensor.disconnect(); 
    connectButton.addEventListener('click', clickConnectButton);
  }
};

/** Add click event  */
connectButton.addEventListener('click', clickConnectButton);

/** Initialization Process */
initializationProcess();

/** Handle environmental sensor */
function handleenvironmentalSensor(event) {
  let result = environmentalSensor.parseSensorData(event.target.value);

  if (sensorInfo.dataIsChanged != result.dataIsChanged) {
    sensorInfo.dataIsChanged = result.dataIsChanged;
    setSensorValue(result);
  }
  else {
    // nothing
  }

  sensorInfo.statusData = result.statusData;

  switch (sensorInfo.statusData) {
    case isInMeasurement :
      statusTextStyle.color = renesasBlue;
      statusText.innerHTML  = "Status: Measurement";
    break;

    case isInCalibration :
      statusTextStyle.color = sensirionGreen;
      statusText.innerHTML  = "Status: Calibration";
    break;

    case isI2cError :
      statusTextStyle.color = renesasGray;
      statusText.innerHTML  = "Status: I2C Error";
    break;

    case isDataError :
      statusTextStyle.color = renesasGray;
      statusText.innerHTML  = "Status: Data Error";
    break;

    default :
      statusTextStyle.color = renesasGray;
      statusText.innerHTML  = "Status: Unknown Error";
    break;
  }
  redrawAllCanvas();  
}

/** Set sensor value */
function setSensorValue(data) {
  sensorInfo.temperature.text.value = String(data.temperatureValue);
  sensorInfo.humidity.text.value    = String(data.humidityValue);
  sensorInfo.co2.text.value         = String(data.co2Value); 

  for (let position = countOfData; position > 0; position--) {
    sensorInfo.temperature.values[position] = sensorInfo.temperature.values[position - 1];
    sensorInfo.humidity.values[position]    = sensorInfo.humidity.values[position - 1];
    sensorInfo.co2.values[position]         = sensorInfo.co2.values[position - 1];
  }

  sensorInfo.temperature.values[0]  = data.temperatureValue;
  sensorInfo.humidity.values[0]     = data.humidityValue;
  sensorInfo.co2.values[0]          = data.co2Value;

  if (countOfData < maxDataLength) {
    countOfData++;
  }
  else {
    countOfData = maxDataLength;
  }
}

/** Click canvas */
fgCanvas.addEventListener('click', event => {
  graphMode = graphMode === 'meter' ? 'line' : 'meter';
  redrawAllCanvas();
});

/** Resize window */
window.onresize = redrawAllCanvas;

/** Change visibility */ 
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    redrawAllCanvas();
  }
});

/** Initialization Process */
function initializationProcess() {

  sensorInfo.temperature.values     = new Array(maxDataLength).fill(null);
  sensorInfo.temperature.text.value = "000.00"; 
  sensorInfo.humidity.values        = new Array(maxDataLength).fill(null);
  sensorInfo.humidity.text.value    = "000.00"; 
  sensorInfo.co2.values             = new Array(maxDataLength).fill(null);
  sensorInfo.co2.text.value         = "00000"; 
  sensorInfo.statusData             = isInMeasurement;
  sensorInfo.dataIsChanged          = null;

  countOfData                       = 0;
  oldEndAngle                       = new Array(maxNumberOfSensor).fill(startAngle);
  currentEndAngle                   = new Array(maxNumberOfSensor).fill(startAngle);
  countOfRepetition                 = 0;
  requestID                         = null;

  statusTextStyle.color             = renesasGray;

  redrawAllCanvas();
}

/** Draw all canvas */ 
function redrawAllCanvas() {
  drawBgCanvas();
  drawFgCanvas();
}

/** Backgroud Canvas */

// Draw background canvas
function drawBgCanvas() {
  bgCanvas  = calculateWidthAndHeightOfCanvas(bgCanvas);
  bgContext = bgCanvas.getContext('2d');
  drawCanvas.clearCanvas(bgContext, bgCanvas.width, bgCanvas.height);
  drawBgGraph(bgContext, bgCanvas.width, bgCanvas.height);
}

// Draw background graph
function drawBgGraph(context, width, height) {
  if (graphMode === 'meter') {
    drawMeterGraph(context, width, height, drawBgMeterGraph);
  }
  else if (graphMode === 'line') {
    drawLineGraph(context, width, height, drawBgLineGraph);
  }
  else {
    // nothing
  }
}

// Draw background meter graph
function drawBgMeterGraph(id, context, graphInfo) {
  drawBgCircle(context, graphInfo);
  drawBgText(id, context, graphInfo);
}

// Draw background circle
function drawBgCircle(context, graphInfo) {
  let x0      = graphInfo.centerX;
  let y0      = graphInfo.centerY;
  let radius  = graphInfo.radius;

  context.lineWidth   = radius / 30;
  context.strokeStyle = renesasGray;
  drawCanvas.drawCircle(context, x0, y0, radius);
}

// Draw background text
function drawBgText(id, context, graphInfo) {
  let fontSizeOfName     = String(Math.round(graphInfo.fontSize / 2));
  let fontSizeOfValue    = String(Math.round(graphInfo.fontSize));
  let fontSizeOfUnit     = String(Math.round(graphInfo.fontSize / 2));
  let yCoordinateOfName  = graphInfo.centerY - graphInfo.fontSize + parseInt(fontSizeOfName)  / 2;
  let yCoordinateOfValue = graphInfo.centerY                      + parseInt(fontSizeOfValue) / 2;
  let yCoordinateOfUnit  = graphInfo.centerY + graphInfo.fontSize + parseInt(fontSizeOfUnit)  / 2;
  let x                  = graphInfo.centerX;

  context.textAlign = "center";
  context.fillStyle = renesasGray;

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

// Draw background line graph
function drawBgLineGraph(id, context, graphInfo) {
  drawBgText(id, context, graphInfo);
  drawBgAxis(context, graphInfo);
  drawBgPointsAndLines(id, context, graphInfo);
}

// Draw axis in background line graph
function drawBgAxis(context, graphInfo) {
  let xAxisLength = graphInfo.xAxisLength;
  let yAxisLength = graphInfo.yAxisLength;
  let x0          = graphInfo.originX;
  let y0          = graphInfo.originY;

  context.lineWidth   = Math.min(xAxisLength, yAxisLength) / 30;
  context.strokeStyle = renesasGray;

  drawCanvas.drawLine(context, x0, y0, x0, y0 - yAxisLength);
  drawCanvas.drawLine(context, x0, y0, x0 + xAxisLength, y0);
}

// Draw points and line in background canvas
function drawBgPointsAndLines(id, context, graphInfo) {
  let xAxisLength = graphInfo.xAxisLength;
  let yAxisLength = graphInfo.yAxisLength;
  let x0          = graphInfo.originX;
  let y0          = graphInfo.originY;
  let radius      = Math.min(xAxisLength, yAxisLength) / 15;
  let xInterval   = Math.max(xAxisLength / (maxDataLength - 1), 0);
  let dataLength  = countOfData;
  let yCoordinates = new Array(dataLength).fill(null);

  context.lineWidth   = radius / 2;
  context.strokeStyle = renesasGray;  
  switch (sensorInfo.statusData) {
    case isInMeasurement :
      context.fillStyle = renesasBlue;
    break;

    case isInCalibration :
      context.fillStyle = sensirionGreen;
    break;

    case isI2cError :
      context.fillStyle = renesasGray;
    break;
  
    case isDataError :
      context.fillStyle = renesasGray;
    break;
  
    default :
      context.fillStyle = renesasGray;
      console.log("Unknown Error");
    break;
  }

  for (let position = 0; position < dataLength; position++) {
    yCoordinates[position] = y0 - getSthConvertedFromValue(id, position, yAxisLength, 0);
  }


  for (let position = (dataLength - 1); position > 0; position--) {
    drawCanvas.drawLine(context, 
             x0 + xInterval * position, 
             yCoordinates[position],
             x0 + xInterval * (position - 1),
             yCoordinates[position - 1]);
  }

  for (let position = 0; position < dataLength; position++) {
    drawCanvas.drawPoint(context, x0 + xInterval * position, yCoordinates[position], radius);
  }
}

/**  Foreground Canvas */

// Draw foreground canvas
function drawFgCanvas() {
  fgCanvas   = calculateWidthAndHeightOfCanvas(fgCanvas);
  fgContext  = fgCanvas.getContext('2d');

  if (graphMode === 'meter') {
    for (let id = 0; id < maxNumberOfSensor; id++) {
      currentEndAngle[id] = startAngle + getSthConvertedFromValue(id, 0, 2 * mathPI, 0);
    }
  }
  else {
    // nothing
  }

  countOfRepetition = 0;
  drawFgGraph();
}

// Draw foreground graph with animation
function drawFgGraph() {
  drawCanvas.clearCanvas(fgContext, fgCanvas.width, fgCanvas.height);
  
  if (graphMode === 'meter') {
    drawMeterGraph(fgContext, fgCanvas.width, fgCanvas.height, drawFgMeterGraph);
  }
  else {
    // nothing
  }

  if (countOfRepetition < maxNumberOfRepetition) {
    countOfRepetition++;
    requestID = requestAnimationFrame(drawFgGraph);
  }
  else {
    countOfRepetition = 0;

    if (graphMode === 'meter') {
      for (let id = 0; id < maxNumberOfSensor; id++) {
        oldEndAngle[id] = currentEndAngle[id];
      }
    }
    else {
      // nothing
    }

    cancelAnimationFrame(requestID);
  }  
}


// Draw foreground meter graph
function drawFgMeterGraph(id, context, graphInfo) {
  let rangeOfAngle  = (currentEndAngle[id] - oldEndAngle[id]) / maxNumberOfRepetition;
  let x0            = graphInfo.centerX;
  let y0            = graphInfo.centerY;
  let radius        = graphInfo.radius * 0.85;

  context.lineWidth   = radius / 10;
  switch (sensorInfo.statusData) {
    case isInMeasurement :
      context.strokeStyle = renesasBlue;
    break;

    case isInCalibration :
      context.strokeStyle = sensirionGreen;
    break;

    case isI2cError :
      context.strokeStyle = renesasGray;
    break;
  
    case isDataError :
      context.strokeStyle = renesasGray;
    break;
  
    default :
      context.strokeStyle = renesasGray;
      console.log("Unknown Error");
    break;
  }

  drawCanvas.drawArc(context, x0, y0, radius, startAngle, oldEndAngle[id] + rangeOfAngle * countOfRepetition);
}

/** common */

// Draw meter graph
function drawMeterGraph(context, width, height, func) {
  let heightIsLonger = (width <= height) ? 1 : 0;
  let graphInfo = {};

  if (heightIsLonger) {
    graphInfo.radius   = Math.min(height / 8, width / 2);
    graphInfo.margin   = graphInfo.radius / 2;
    graphInfo.centerX  = width / 2;
    graphInfo.centerY  = 0;
    graphInfo.fontSize = graphInfo.radius / 3;

    for (let id = 0; id < maxNumberOfSensor; id++) {
      graphInfo.centerY += (graphInfo.margin + graphInfo.radius);
      func(id, context, graphInfo);
      graphInfo.centerY += graphInfo.radius;
    }
  }
  else {
    graphInfo.radius   = Math.min(width / 8, height / 2);
    graphInfo.margin   = graphInfo.radius / 2;
    graphInfo.centerX  = 0;
    graphInfo.centerY  = height / 2;
    graphInfo.fontSize = graphInfo.radius / 3;

    for (let id = 0; id < maxNumberOfSensor; id++) {
      graphInfo.centerX += (graphInfo.margin + graphInfo.radius);
      func(id, context, graphInfo);
      graphInfo.centerX += graphInfo.radius;
    }
  }
}

// Draw line graph
function drawLineGraph(context, width, height, func) {
  let graphInfo = {};

  graphInfo.yAxisLength = height / 5;
  graphInfo.yMargin     = graphInfo.yAxisLength / 2;
  graphInfo.xMargin     = width / 10;
  graphInfo.xAxisLength = graphInfo.xMargin * 7;

  graphInfo.originX     = graphInfo.xMargin * 2;
  graphInfo.centerX     = graphInfo.xMargin;     
  graphInfo.radius      = graphInfo.yAxisLength / 2;
  graphInfo.fontSize    = graphInfo.radius / 2;

  for (let id = 0; id < maxNumberOfSensor; id++) {
    graphInfo.originY = (graphInfo.yMargin + graphInfo.yAxisLength) * (id + 1);
    graphInfo.centerY =  graphInfo.originY - graphInfo.radius;
    func(id, context, graphInfo);
  }  
}

// Get something value converted from sensor value.
function getSthConvertedFromValue(id, position, somethingMax, somethingMin) {
  switch (id) {
    case sensorInfo.temperature.sensorID :
      return convertSrcToSth(sensorInfo.temperature.values[position],
                             sensorInfo.temperature.maxValue,
                             sensorInfo.temperature.minValue,
                             somethingMax,
                             somethingMin);

    case sensorInfo.humidity.sensorID :
      return convertSrcToSth(sensorInfo.humidity.values[position],
                             sensorInfo.humidity.maxValue,
                             sensorInfo.humidity.minValue,
                             somethingMax,
                             somethingMin);

    case sensorInfo.co2.sensorID :
      return convertSrcToSth(sensorInfo.co2.values[position],
                             sensorInfo.co2.maxValue,
                             sensorInfo.co2.minValue,
                             somethingMax,
                             somethingMin);

    default :
      return 0;
  }
}

// Convert source value to something value
function convertSrcToSth(sourceCurrent, sourceMax, sourceMin, somethingMax, somethingMin) {
  if      (sourceCurrent === null)      return 0;
  else if (sourceCurrent >= sourceMax)  return somethingMax;
  else if (sourceCurrent <= sourceMin)  return somethingMin;
  else                                  return (sourceCurrent - sourceMin) * (somethingMax - somethingMin) / (sourceMax - sourceMin);
}

 // Calculate width and height of canvas
 function calculateWidthAndHeightOfCanvas(canvas) {
  canvas.width  = drawCanvas.calculateWidth(canvas);
  canvas.height = drawCanvas.calculateHeight(canvas);
  return canvas;
}

