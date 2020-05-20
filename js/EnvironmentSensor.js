(function() {
  'use strict';

  const CALIBRATION_NO  = 0
  const CALIBRATION_YES = 1

  class EnvironmentSensor {
    constructor() {
      this.device                   = null;
      this.server                   = null;
      this.characteristic           = null;
      this.userDeviceName           = 'RL78G1D'
      this.userServiceUUID          = '92b60060-fa5f-4dcc-9312-d8f3dad1675f'
      this.userCharacteristicUUID   = '92b60125-fa5f-4dcc-9312-d8f3dad1675f'
    }

    connect() {      
      return navigator.bluetooth.requestDevice({
        filters: [{
          name:  this.userDeviceName
        }],
        optionalServices: [this.userServiceUUID]      
        })
      .then(device => {
        document.getElementById('statusText').innerHTML = "Connect the device"
        this.device = device;
        this.device.addEventListener('gattserverdisconnected', this.disconnect);
        return device.gatt.connect();
      })
      .then(server => {
        document.getElementById('statusText').innerHTML = "Get the service"
        return server.getPrimaryService(this.userServiceUUID)
      })
      .then(service => {
        document.getElementById('statusText').innerHTML = "Get the characateristic"
        return service.getCharacteristic(this.userCharacteristicUUID)
      })
      .then(characteristic => {
        this.characteristic = characteristic
        document.getElementById('statusText').innerHTML = "Start notification"
        return characteristic.startNotifications()
      })      
    }

    disconnect() {   
      if (!this.device) {
        var error = "No Bluetooth Device";
        document.getElementById('statusText').innerHTML = error
        console.log('Error : ' + error);
        return;
      }
    
      if (this.device.gatt.connected) {
        document.getElementById('connectButton').innerHTML = "CONNECT"
        document.getElementById('statusText').innerHTML = "Disconnect the device"
        console.log('Execute : disconnect');
        
        return this.device.gatt.disconnect();
      } 
      else {
       var error = "Bluetooth Device is already disconnected";
       document.getElementById('statusText').innerHTML = error
       console.log('Error : ' + error);
       return;
      }   

    }

    parseSensorData(value) {
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      let result = {}
      
      // Calculate sensor data
      result.temperatureData  = (value.getUint8(0) << 8) + value.getUint8(1) + (value.getUint8(2) * 0.01)
      result.humidityData     = (value.getUint8(3) << 8) + value.getUint8(4) + (value.getUint8(5) * 0.01)
      result.co2Data          = (value.getUint8(6) << 8) + value.getUint8(7)
      result.calibration      = value.getUint8(8)

      // Set sensor data to text
      document.getElementById('temperatureData').innerHTML  = "TEMP: " + result.temperatureData + " °C"
      document.getElementById('humidityData').innerHTML     = "HUMI: " + result.humidityData + " %RH"
      document.getElementById('co2Data').innerHTML          = "CO2: " + result.co2Data + " ppm"
      if (result.calibration == CALIBRATION_NO) {
        document.getElementById('statusText').innerHTML = "Measurement"
      }
      else {
        document.getElementById('statusText').innerHTML      = "Calibration"
      }

      // Log
      console.log("Temperature: " + result.temperatureData)
      console.log("Humidity: "    + result.humidityData)
      console.log("CO2: "         + result.co2Data)
      console.log("Calibration: " + result.calibration)

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
