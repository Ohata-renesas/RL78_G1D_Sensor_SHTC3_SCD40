(function() {
  'use strict';

  const CONNECT     = 1
  const DISCONNECT  = 0

  class EnvironmentSensor {
    constructor() {
      this.device                   = null;
      this.server                   = null;
      this.userDeviceName           = 'RL78G1D'
      this.userServiceUUID          = '92b60060-fa5f-4dcc-9312-d8f3dad1675f'
      this.userCharacteristicUUID   = '92b60125-fa5f-4dcc-9312-d8f3dad1675f'
      this._characteristics         = new Map();
      this.connectionStatus         = DISCONNECT
    }

    connect() {      
      return navigator.bluetooth.requestDevice({
        filters: [{
          name:  this.userDeviceName
        }],
        optionalServices: [this.userServiceUUID]      
        })
      .then(device => {
        this.device = device;
        return device.gatt.connect();
      })
      .then(server => {
        return server.getPrimaryService(this.userServiceUUID)
      })
      .then(service => {
        return service.getCharacteristic(this.userCharacteristicUUID)
      })
      .then(characteristic => {
        characteristic.startNotifications().then(_ => {
          characteristic.addEventListener('characteristicvaluechanged', event => {
            let result = this.parseSensorData(event.target.value)
          })
        })
      })      
    }

    disconnect() {      
      if (!this.device) {
        var error = "No Bluetooth Device";
        console.log('Error : ' + error);
        return;
      }
    
      if (this.device.gatt.connected) {
        console.log('Execute : disconnect');
        return this.device.gatt.disconnect();
      } 
      else {
       var error = "Bluetooth Device is already disconnected";
       console.log('Error : ' + error);
       return;
      }
    }

    changeConnectionStatus(status) {
      this.connectionStatus = status
    }

    parseSensorData(value) {
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      let result = {}
      
      result.temperatureData  = (value.getUint8(0) << 8) + value.getUint8(1) + (value.getUint8(2) * 0.01)
      result.humidityData     = (value.getUint8(3) << 8) + value.getUint8(4) + (value.getUint8(5) * 0.01)
      result.co2Data          = (value.getUint8(6) << 8) + value.getUint8(7)

      document.getElementById('temperatureData').innerHTML  = "TEMP: " + result.temperatureData + " °C"
      document.getElementById('humidityData').innerHTML     = "HUMI: " + result.humidityData + " %RH"
      document.getElementById('co2Data').innerHTML          = "CO2: " + result.co2Data 
      return result;
    }

    /* Utils */
    _setCharacteristic(characteristicUuid, characteristic) {
      return this._characteristics.set(characteristicUuid, characteristic);
    }
    
    _startNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.startNotifications()
    }

    _stopNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to remove characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.stopNotifications()
      .then(() => characteristic);
    }
  }

  window.environmentSensor = new EnvironmentSensor();
  window.isConnected       = CONNECT;
  window.isDisconnected    = DISCONNECT;

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
