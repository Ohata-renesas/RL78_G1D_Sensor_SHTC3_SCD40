(function() {
  'use strict';

  const DISCONNECT      = 0;
  const CONNECT         = 1;
  const CALIBRATION_NO  = 0;
  const CALIBRATION_YES = 1;

  class EnvironmentSensor {
    constructor() {
      this.device                   = null;
      this.server                   = null;
      this.characteristic           = null;
      this.userDeviceName           = 'RL78G1D';
      this.userServiceUUID          = '92b60060-fa5f-4dcc-9312-d8f3dad1675f';
      this.userCharacteristicUUID   = '92b60125-fa5f-4dcc-9312-d8f3dad1675f';
      this.connectionStatus         = DISCONNECT;
      this.statusText               = document.getElementById('statusText');
      this.connectButton            = document.getElementById('connectButton');
    }

    connect() {      
      return navigator.bluetooth.requestDevice({
        filters: [{
          name:  this.userDeviceName
        }],
        optionalServices: [this.userServiceUUID]      
        })
      .then(device => {
        this.statusText.innerHTML = "Connect the device";
        this.device = device;
        this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
        return device.gatt.connect();
      })
      .then(server => {
        this.statusText.innerHTML = "Get the service";
        return server.getPrimaryService(this.userServiceUUID);
      })
      .then(service => {
        this.statusText.innerHTML = "Get the characateristic";
        return service.getCharacteristic(this.userCharacteristicUUID);
      })
      .then(characteristic => {
        this.characteristic = characteristic;
        this.statusText.innerHTML = "Start notification";
        return characteristic.startNotifications();
      })      
    }

    disconnect() {   
      if (!this.device) {
        var error = "No Bluetooth Device";
        this.statusText.innerHTML = error;
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
       this.connectionStatus = DISCONNECT;
       document.getElementById('connectButton').innerHTML = "CONNECT";
       this.statusText.innerHTML = error;
       console.log('Error : ' + error);
       return;
      }   

    }

    onDisconnected(event) {
      document.getElementById('connectButton').innerHTML = "CONNECT";
      this.statusText.innerHTML = "Disconnect the device";
    }

    isConnected() {
      return this.connectionStatus;
    }

    changeConnectionStatus() {
      
      switch (this.connectionStatus) {
        case CONNECT :
          this.connectionStatus = DISCONNECT;
          document.getElementById('connectButton').innerHTML = "CONNECT";
          this.statusText.innerHTML = "Disconnect the device";
          break;

        case DISCONNECT :
          this.connectionStatus = CONNECT;
          document.getElementById('connectButton').innerHTML = "DISCONNECT";
          this.statusText.innerHTML = "Measurement";
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
      result.calibration        = value.getUint8(8);
      result.dataIsChanged      = value.getUint8(9);

      // // Set sensor data to text
      if (result.calibration == CALIBRATION_NO) {
        this.statusText.innerHTML     = "Measurement";
      }
      else {
        this.statusText.innerHTML     = "Calibration";
      }

      // Log
      console.log("Temperature: " + result.temperatureValue);
      console.log("Humidity: "    + result.humidityValue);
      console.log("CO2: "         + result.co2Value);
      console.log("Calibration: " + result.calibration);
      console.log("dataISChanged: " + result.dataIsChanged);

      return result;
    }
  }

  window.environmentSensor    = new EnvironmentSensor();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      // 登録成功
      console.log('ServiceWorker の登録に成功しました。スコープ: ', registration.scope);
    }).catch(function(err) {
      // 登録失敗
      console.log('ServiceWorker の登録に失敗しました。', err);
    });
  }

})();
