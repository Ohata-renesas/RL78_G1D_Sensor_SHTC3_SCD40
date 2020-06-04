(function() {
  'use strict';

  const flagOFF           = 0;
  const flagON            = 1;
  const isDisconnected    = 0;
  const isConnected       = 1;
  const isInReconnection  = 2;
  const backgroundColor   = "white";
  const textShadow        = "1px 1px 3px #333333, 1px -1px 3px #333333, -1px 1px 3px #333333, -1px -1px 3px #333333"; 
  const renesasBlue       = "#2A289D";
  const renesasGray       = "#333333";
  const maxOfCount        = 10;
  let Countdown           = maxOfCount;
  let timeOutID           = null;
  let clickButtonFlag     = flagOFF;

  /** initialize data */
  const initializeData = () => {
    if (timeOutID) clearTimeout(timeOutID);
    Countdown       = maxOfCount;
    timeOutID       = null;
    clickButtonFlag = flagOFF;     
  }

  /** Reconnect the ble device */
  const reconnect = () => {
    if (window.environmentalSensor.connectionStatus === isInReconnection) {
      console.log("Reconnection countdown: " + Countdown);
      window.environmentalSensor.connect()
      .then(_ => {
        if (clickButtonFlag === flagON) {
          initializeData();  
          window.environmentalSensor.disconnect();
        }
        else {
          Countdown = maxOfCount;
        }
      })
      .catch(error => {
        console.log("error:" + error);
        document.getElementById('statusText').innerHTML = error;
        if (clickButtonFlag === flagON) {
          initializeData();  
          window.environmentalSensor.changeConnectionStatus();
        }
        else {
          timeOutID = setTimeout(reconnect, 10000);
          if (Countdown > 0) {
            Countdown--;            
          }
          else {
            initializeData(); 
            window.environmentalSensor.changeConnectionStatus();
            console.log("Cannot connect device...");
          }      
        }
      });
    }
  }

  /** Class that communicate with Environmental Sensor */
  class EnvironmentalSensor {
    constructor() {
      this.device                   = null;
      this.server                   = null;
      this.characteristic           = null;
      this.userDeviceName           = 'RL78G1D';
      this.userServiceUUID          = '92b60060-fa5f-4dcc-9312-d8f3dad1675f';
      this.userCharacteristicUUID   = '92b60125-fa5f-4dcc-9312-d8f3dad1675f';
      this.connectionStatus         = isDisconnected;
      this.handler                  = null;
    }

    /** Connect ble device and start notification */
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
        if (this.connectionStatus === isInReconnection) this.connectionStatus = isDisconnected;
        this.changeConnectionStatus();
        this.characteristic.addEventListener('characteristicvaluechanged', this.handler);
        console.log("Start notification");
        return characteristic.startNotifications();
      })      
    }

    /** Search new ble device or use the device that I already have */
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
        console.log("Use the device information that I already have");
        return this.device.gatt.connect();
      }
    }

    /** Disconnect the ble device */
    disconnect() {   
      if (!this.device) {
        var error = "No Bluetooth Device";
        document.getElementById('statusText').innerHTML = "Status: " + error;
        console.log('Error : ' + error);
        return;
      }
    
      if (this.device.gatt.connected) {
        clickButtonFlag = flagON;
        this.changeConnectionStatus();
        console.log('Execute : disconnect');
        return this.device.gatt.disconnect();
      } 
      else {
       var error = "Please tap or click again.";
       this.connectionStatus = isDisconnected;
       document.getElementById('connectButton').innerHTML = "CONNECT";
       document.getElementById('statusText').innerHTML    = "Status: " + error;
       console.log('Error : ' + error);
       return;
      }   
    }

    /** Reset data in reconnection */
    reset() {
      clickButtonFlag = flagON;
      document.getElementById('statusText').innerHTML = "Status: Please wait for a while";
      console.log("Please wait for a while");
    }

    /** Reconnect the ble device when communicaton is disconnected */
    onDisconnected() {
      if (clickButtonFlag === flagOFF) {
        document.getElementById('statusText').style.color = renesasGray;
        document.getElementById('statusText').innerHTML   = "Status: Reconnect the device";
        window.environmentalSensor.connectionStatus       = isInReconnection;
        reconnect();
      }
      else {
        clickButtonFlag = flagOFF;
      }
    }

    /** Set handler function */
    setHandler(handler) {
      this.handler = handler;
    }

    /** Change connection status */
    changeConnectionStatus() {
      
      switch (this.connectionStatus) {
        case isConnected :
          this.connectionStatus = isDisconnected;
          document.getElementById('connectButton').style.color      = backgroundColor;
          document.getElementById('connectButton').style.textShadow = textShadow;
          document.getElementById('connectButton').innerHTML        = "CONNECT";
          document.getElementById('statusText').style.color         = renesasGray;
          document.getElementById('statusText').innerHTML           = "Status: Disconnect the device";
        break;

        case isDisconnected :
          this.connectionStatus = isConnected;
          document.getElementById('connectButton').style.color      = renesasGray;
          document.getElementById('connectButton').style.textShadow = "none";
          document.getElementById('connectButton').innerHTML        = "DISCONNECT";
          document.getElementById('statusText').style.color         = renesasBlue;
          document.getElementById('statusText').innerHTML           = "Status: Measurement";
        break;

        case isInReconnection :
          this.connectionStatus = isDisconnected;
          document.getElementById('connectButton').style.color      = backgroundColor;
          document.getElementById('connectButton').style.textShadow = textShadow;
          document.getElementById('connectButton').innerHTML        = "CONNECT";
          document.getElementById('statusText').style.color         = renesasGray;
          document.getElementById('statusText').innerHTML           = "Status: Please tap or click again";
        break;

        default :
        break;
      }
    }

    /** Parse sensor data taht received from ble device */
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

  // Set class as window property
  window.environmentalSensor    = new EnvironmentalSensor();

  // Set parameters as window property
  window.isConnected            = isConnected;
  window.isDisconnected         = isDisconnected;
  window.isInReconnection       = isInReconnection;

})();
