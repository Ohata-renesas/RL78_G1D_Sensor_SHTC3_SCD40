(function() {
  'use strict';

  const isDisconnected  = 0;
  const isConnected     = 1;
  const backgroundColor = "white";
  const textShadow      = "1px 1px 3px #333333, 1px -1px 3px #333333, -1px 1px 3px #333333, -1px -1px 3px #333333"; 
  const renesasBlue           = "#2A289D";
  const renesasGray           = "#333333";

  class EnvironmentalSensor {
    constructor() {
      this.device                   = null;
      this.server                   = null;
      this.characteristic           = null;
      this.userDeviceName           = 'RL78G1D';
      this.userServiceUUID          = '92b60060-fa5f-4dcc-9312-d8f3dad1675f';
      this.userCharacteristicUUID   = '92b60125-fa5f-4dcc-9312-d8f3dad1675f';
      this.connectionStatus         = isDisconnected;
    }

    connect() {   
      return this.connectDevice()
      .then(server => {
        document.getElementById('statusText').innerHTML = "Status: Get the service";
        console.log("Get the service");
        return server.getPrimaryService(this.userServiceUUID);
      })
      .then(service => {
        document.getElementById('statusText').innerHTML = "Status: Get the characateristic";
        console.log("Get the Characteristic");
        return service.getCharacteristic(this.userCharacteristicUUID);
      })
      .then(characteristic => {
        this.characteristic = characteristic;
        document.getElementById('statusText').innerHTML = "Status: Start notification";
        console.log("Start notification");
        return characteristic.startNotifications();
      })      
    }

    connectDevice() {
      if (!this.device) {
        console.log("Search the device");
        return navigator.bluetooth.requestDevice({
          filters: [{
            name:  this.userDeviceName
          }],
          optionalServices: [this.userServiceUUID]      
          })
        .then(device => {
          document.getElementById('statusText').innerHTML = "Status: Connect the device";
          this.device = device;
          this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
          return device.gatt.connect();
        })
      }
      else {
        document.getElementById('statusText').innerHTML = "Status: Connect the device";
        console.log("Use the device information that you already have");
        return this.device.gatt.connect();
      }
    }

    disconnect() {   
      if (!this.device) {
        var error = "No Bluetooth Device";
        document.getElementById('statusText').innerHTML = "Status: " + error;
        console.log('Error : ' + error);
        return;
      }
    
      if (this.device.gatt.connected) {
        this.changeConnectionStatus();
        console.log('Execute : disconnect');
        return this.device.gatt.disconnect();
      } 
      else {
       var error = "Please click again.";
       this.connectionStatus = isDisconnected;
       document.getElementById('connectButton').innerHTML = "CONNECT";
       document.getElementById('statusText').innerHTML = "Status: " + error;
       console.log('Error : ' + error);
       return;
      }   
    }

    onDisconnected(event) {
      document.getElementById('connectButton').style.color = backgroundColor;
      document.getElementById('connectButton').style.textShadow = textShadow;
      document.getElementById('connectButton').innerHTML = "CONNECT";
      document.getElementById('statusText').style.color = renesasGray;
      document.getElementById('statusText').innerHTML = "Status: Disconnect the device";
    }

    isConnected() {
      return this.connectionStatus;
    }

    changeConnectionStatus() {
      
      switch (this.connectionStatus) {
        case isConnected :
          this.connectionStatus = isDisconnected;
          document.getElementById('connectButton').style.color = backgroundColor;
          document.getElementById('connectButton').style.textShadow = textShadow;
          document.getElementById('connectButton').innerHTML = "CONNECT";
          document.getElementById('statusText').style.color = renesasGray;
          document.getElementById('statusText').innerHTML = "Status: Disconnect the device";
        break;

        case isDisconnected :
          this.connectionStatus = isConnected;
          document.getElementById('connectButton').style.color = renesasGray;
          document.getElementById('connectButton').style.textShadow = "none";
          document.getElementById('connectButton').innerHTML = "DISCONNECT";
          document.getElementById('statusText').style.color = renesasBlue;
          document.getElementById('statusText').innerHTML = "Status: Measurement";
         break;

        default :
        break;
      }
    }

    parseSensorData(value) {
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      let result = {}
      
      // Calculate sensor data
      result.temperatureValue   = (value.getUint8(0) << 8) + value.getUint8(1) + (value.getUint8(2) * 0.01);
      result.humidityValue      = (value.getUint8(3) << 8) + value.getUint8(4) + (value.getUint8(5) * 0.01);
      result.co2Value           = (value.getUint8(6) << 8) + value.getUint8(7);
      result.statusData         =  value.getUint8(8);
      result.dataIsChanged      =  value.getUint8(9);

      // Log
      console.log("Temperature: "   + result.temperatureValue);
      console.log("Humidity: "      + result.humidityValue);
      console.log("CO2: "           + result.co2Value);
      console.log("Status: "        + result.statusData);
      console.log("dataIsChanged: " + result.dataIsChanged);

      return result;
    }
  }

  window.environmentalSensor    = new EnvironmentalSensor();

})();
