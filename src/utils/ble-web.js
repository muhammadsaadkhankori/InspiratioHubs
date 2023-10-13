class BleDevice {
    constructor() {
      this.deviceName = "METAxHUB";
      this.serviceUuid = 0xFFE0;
      this.characteristicUuid = 0xFFE1;
      this.device = null;
      this.characteristic = null;
    }
    
    async connectAndSetUp() {
        try {
            this.device = await this.at_gapscan();
            console.log('Device:', this.device);
            if (this.device) {
                const server = await this.at_gapconnect(this.device);
                const service = await server.getPrimaryService(this.serviceUuid);
                console.log('Characteristics in Service:', await service.getCharacteristics());
                this.characteristic = await service.getCharacteristic(this.characteristicUuid);
                // Add an event listener to handle notifications
                this.characteristic.startNotifications().then(() => {
                    console.log('Notifications started');
                    this.characteristic.addEventListener('characteristicvaluechanged', this.handleNotifications);
                });
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Function to handle incoming notifications
    handleNotifications(event) {
        let value = new TextDecoder('utf-8').decode(event.target.value);
        console.log('Received notification:', value);
    }
  
    async disconnect() {
      try {
        if (this.device.gatt.connected) {
          this.device.gatt.disconnect();
          this.characteristic = null;
          this.device = null;
        }
      } catch (error) {
        console.error(error);
      }
    }
  
    async writeData(data) {
      try {
        if (!this.characteristic) throw new Error("Characteristic is not defined.");
        console.log('Writing data:', data);
        const encoder = new TextEncoder();
        const value = encoder.encode(data);
        console.log('Data encoded:', value);
        console.log('Characteristic:', this.characteristic);
        const response = await this.characteristic.writeValueWithResponse(value)
        console.log('Data written successfully', response);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }

    // Function to check connected status
    async isConnected() {
      try {
        if (this.device) {
          return await this.device.gatt.connected;
        }
        return false;
      } catch (error) {
        console.error(error);
        return false;
      }
    }

    // Function to check if bluetooth exists in the browser and device
    async isBluetoothAvailable() {
      try {
        if (!navigator.bluetooth) {
          return false;
        }
        const device = await this.at_gapscan();
        if (!device) {
          return false;
        }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
    
    // Function to scan for devices and return the device with name METAxHUB
    async at_gapscan() {
      const options = {
        filters: [{
          services: [this.serviceUuid]
        }]
      };
      
      const device = await navigator.bluetooth.requestDevice(options);
      if (device.name === this.deviceName) {
        return device;
      }
      
      return null;
    }
    
    // Function to connect to the device
    async at_gapconnect(device) {
      if (device) {
        return await device.gatt.connect();
      }
      return null;
    }
  }
  
  export default BleDevice;
  