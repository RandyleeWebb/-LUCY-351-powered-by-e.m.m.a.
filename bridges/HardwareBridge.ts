/**
 * LUCY SOVEREIGN 137 - Hardware Bridge
 * Connects Lucy to physical hardware: GPIO, Serial, USB, Network devices
 * Supports sensors, actuators, and embedded system integration
 */

import { globalEventBus, SystemMessage } from '../core/EventBus';

// Hardware Types
interface HardwareDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'controller' | 'display' | 'input' | 'output' | 'composite';
  interface: 'gpio' | 'serial' | 'usb' | 'i2c' | 'spi' | 'network' | 'bluetooth';
  status: 'online' | 'offline' | 'error' | 'calibrating';
  lastSeen: Date;
  config: Record<string, any>;
  capabilities: string[];
}

interface SensorReading {
  deviceId: string;
  sensorType: string;
  value: number | string | boolean;
  unit: string;
  timestamp: Date;
  quality: number; // 0-1 signal quality
  metadata?: Record<string, any>;
}

interface ActuatorCommand {
  deviceId: string;
  command: string;
  params: Record<string, any>;
  priority: 'immediate' | 'high' | 'normal' | 'low';
  timestamp: Date;
}

interface GPIOPin {
  pin: number;
  mode: 'input' | 'output' | 'pwm' | 'spi' | 'i2c' | 'uart';
  value: number;
  pullUp: boolean;
  pullDown: boolean;
  label: string;
}

interface SerialPort {
  path: string;
  baudRate: number;
  dataBits: 5 | 6 | 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd';
  isOpen: boolean;
}

interface NetworkDevice {
  interface: string;
  type: 'ethernet' | 'wifi' | 'bluetooth' | 'cellular';
  ipAddress: string;
  macAddress: string;
  isUp: boolean;
  stats: {
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
    errors: number;
  };
}

/**
 * Hardware Bridge - Physical hardware integration for Lucy Sovereign
 */
export class HardwareBridge {
  private devices: Map<string, HardwareDevice> = new Map();
  private gpioPins: Map<number, GPIOPin> = new Map();
  private serialPorts: Map<string, SerialPort> = new Map();
  private networkInterfaces: Map<string, NetworkDevice> = new Map();
  
  private sensorBuffer: SensorReading[] = [];
  private maxBufferSize: number = 10000;
  
  private pollIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isScanning: boolean = false;

  constructor() {
    this.initializeGPIO();
    this.startHardwareMonitor();
  }

  /**
   * Initialize GPIO pins (Raspberry Pi style)
   */
  private initializeGPIO(): void {
    // Standard GPIO pin layout
    const pinConfigs: Array<{ pin: number; mode: GPIOPin['mode']; label: string }> = [
      { pin: 2, mode: 'i2c', label: 'SDA' },
      { pin: 3, mode: 'i2c', label: 'SCL' },
      { pin: 4, mode: 'input', label: 'GPIO4' },
      { pin: 5, mode: 'input', label: 'GPIO5' },
      { pin: 6, mode: 'input', label: 'GPIO6' },
      { pin: 7, mode: 'spi', label: 'CE1' },
      { pin: 8, mode: 'spi', label: 'CE0' },
      { pin: 9, mode: 'spi', label: 'MISO' },
      { pin: 10, mode: 'spi', label: 'MOSI' },
      { pin: 11, mode: 'spi', label: 'SCLK' },
      { pin: 12, mode: 'pwm', label: 'PWM0' },
      { pin: 13, mode: 'pwm', label: 'PWM1' },
      { pin: 14, mode: 'uart', label: 'TXD' },
      { pin: 15, mode: 'uart', label: 'RXD' },
      { pin: 17, mode: 'input', label: 'GPIO17' },
      { pin: 18, mode: 'output', label: 'GPIO18' },
      { pin: 22, mode: 'input', label: 'GPIO22' },
      { pin: 23, mode: 'input', label: 'GPIO23' },
      { pin: 24, mode: 'input', label: 'GPIO24' },
      { pin: 25, mode: 'input', label: 'GPIO25' },
      { pin: 27, mode: 'input', label: 'GPIO27' },
    ];

    pinConfigs.forEach(config => {
      this.gpioPins.set(config.pin, {
        pin: config.pin,
        mode: config.mode,
        value: 0,
        pullUp: false,
        pullDown: false,
        label: config.label
      });
    });
  }

  /**
   * Start hardware monitoring loop
   */
  private startHardwareMonitor(): void {
    setInterval(() => {
      this.scanDevices();
      this.checkDeviceHealth();
    }, 5000); // Every 5 seconds
  }

  /**
   * Scan for connected hardware devices
   */
  private async scanDevices(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;

    try {
      // In production, would scan actual hardware
      // USB devices, serial ports, network interfaces, etc.

      const msg: SystemMessage = {
        id: `hw-scan-${Date.now()}`,
        source: 'HARDWARE_BRIDGE',
        target: 'LL007', // NEURAL_STREAM
        type: 'HARDWARE_SCAN_COMPLETE',
        payload: {
          devicesFound: this.devices.size,
          gpioPins: this.gpioPins.size,
          serialPorts: this.serialPorts.size
        },
        timestamp: new Date(),
        priority: 'LOW'
      };
      globalEventBus.publish(msg);

    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Check health of all devices
   */
  private checkDeviceHealth(): void {
    const now = new Date();
    this.devices.forEach((device, id) => {
      const timeSinceLastSeen = now.getTime() - device.lastSeen.getTime();
      if (timeSinceLastSeen > 30000 && device.status === 'online') {
        device.status = 'offline';
        this.publishDeviceStatus(id, 'offline');
      }
    });
  }

  /**
   * Register a new hardware device
   */
  registerDevice(device: Omit<HardwareDevice, 'lastSeen'>): void {
    const fullDevice: HardwareDevice = {
      ...device,
      lastSeen: new Date()
    };
    this.devices.set(device.id, fullDevice);
    
    console.log(`[HARDWARE_BRIDGE] Registered device: ${device.name} (${device.type})`);

    const msg: SystemMessage = {
      id: `hw-register-${device.id}`,
      source: 'HARDWARE_BRIDGE',
      target: 'LL060', // GRAND_CENTRAL
      type: 'DEVICE_REGISTERED',
      payload: fullDevice,
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);
  }

  /**
   * Unregister a device
   */
  unregisterDevice(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      this.devices.delete(deviceId);
      console.log(`[HARDWARE_BRIDGE] Unregistered device: ${device.name}`);

      const msg: SystemMessage = {
        id: `hw-unregister-${Date.now()}`,
        source: 'HARDWARE_BRIDGE',
        target: 'LL060',
        type: 'DEVICE_UNREGISTERED',
        payload: { deviceId, deviceName: device.name },
        timestamp: new Date(),
        priority: 'NORMAL'
      };
      globalEventBus.publish(msg);
    }
  }

  /**
   * Read from a sensor
   */
  async readSensor(deviceId: string): Promise<SensorReading | null> {
    const device = this.devices.get(deviceId);
    if (!device || device.type !== 'sensor') {
      console.error(`[HARDWARE_BRIDGE] Invalid sensor device: ${deviceId}`);
      return null;
    }

    // In production, would read actual sensor data
    const reading: SensorReading = {
      deviceId,
      sensorType: device.config.sensorType || 'generic',
      value: device.config.lastValue || 0,
      unit: device.config.unit || '',
      timestamp: new Date(),
      quality: 1.0
    };

    this.bufferSensorReading(reading);
    device.lastSeen = new Date();

    const msg: SystemMessage = {
      id: `hw-reading-${Date.now()}`,
      source: 'HARDWARE_BRIDGE',
      target: 'LL001', // NEON_VORTEX
      type: 'SENSOR_READING',
      payload: reading,
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return reading;
  }

  /**
   * Write to an actuator
   */
  async writeActuator(deviceId: string, value: any): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device || device.type !== 'actuator') {
      console.error(`[HARDWARE_BRIDGE] Invalid actuator device: ${deviceId}`);
      return false;
    }

    // In production, would write to actual actuator
    console.log(`[HARDWARE_BRIDGE] Writing to ${device.name}: ${value}`);
    device.lastSeen = new Date();

    const msg: SystemMessage = {
      id: `hw-actuator-${Date.now()}`,
      source: 'HARDWARE_BRIDGE',
      target: 'LL018', // Control output
      type: 'ACTUATOR_WRITE',
      payload: { deviceId, value, deviceName: device.name },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return true;
  }

  /**
   * Send command to actuator
   */
  async sendActuatorCommand(command: ActuatorCommand): Promise<boolean> {
    const device = this.devices.get(command.deviceId);
    if (!device) return false;

    console.log(`[HARDWARE_BRIDGE] Command to ${device.name}: ${command.command}`);

    const msg: SystemMessage = {
      id: `hw-cmd-${Date.now()}`,
      source: 'HARDWARE_BRIDGE',
      target: 'LL042', // PATH_FINDER
      type: 'ACTUATOR_COMMAND',
      payload: command,
      timestamp: new Date(),
      priority: command.priority === 'immediate' ? 'CRITICAL' : 
               command.priority === 'high' ? 'HIGH' : 'NORMAL'
    };
    globalEventBus.publish(msg);

    return true;
  }

  /**
   * Set GPIO pin value
   */
  setGPIO(pin: number, value: number): boolean {
    const gpioPin = this.gpioPins.get(pin);
    if (!gpioPin || gpioPin.mode !== 'output') {
      console.error(`[HARDWARE_BRIDGE] Invalid GPIO pin for output: ${pin}`);
      return false;
    }

    gpioPin.value = value;
    
    const msg: SystemMessage = {
      id: `hw-gpio-${Date.now()}`,
      source: 'HARDWARE_BRIDGE',
      target: 'LL016', // Motor control
      type: 'GPIO_SET',
      payload: { pin, value, label: gpioPin.label },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return true;
  }

  /**
   * Read GPIO pin value
   */
  readGPIO(pin: number): number | null {
    const gpioPin = this.gpioPins.get(pin);
    if (!gpioPin) {
      console.error(`[HARDWARE_BRIDGE] Invalid GPIO pin: ${pin}`);
      return null;
    }

    // In production, would read actual pin
    return gpioPin.value;
  }

  /**
   * Configure GPIO pin mode
   */
  configureGPIO(pin: number, mode: GPIOPin['mode'], options?: { pullUp?: boolean; pullDown?: boolean }): boolean {
    const gpioPin = this.gpioPins.get(pin);
    if (!gpioPin) return false;

    gpioPin.mode = mode;
    if (options) {
      gpioPin.pullUp = options.pullUp || false;
      gpioPin.pullDown = options.pullDown || false;
    }

    console.log(`[HARDWARE_BRIDGE] Configured GPIO ${pin} as ${mode}`);
    return true;
  }

  /**
   * Open serial port
   */
  async openSerialPort(path: string, baudRate: number = 9600): Promise<boolean> {
    const port: SerialPort = {
      path,
      baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      isOpen: true
    };

    this.serialPorts.set(path, port);
    console.log(`[HARDWARE_BRIDGE] Opened serial port: ${path} @ ${baudRate} baud`);

    const msg: SystemMessage = {
      id: `hw-serial-${Date.now()}`,
      source: 'HARDWARE_BRIDGE',
      target: 'LL007', // NEURAL_STREAM
      type: 'SERIAL_PORT_OPENED',
      payload: { path, baudRate },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return true;
  }

  /**
   * Write to serial port
   */
  async writeSerial(path: string, data: Buffer | string): Promise<boolean> {
    const port = this.serialPorts.get(path);
    if (!port || !port.isOpen) {
      console.error(`[HARDWARE_BRIDGE] Serial port not open: ${path}`);
      return false;
    }

    console.log(`[HARDWARE_BRIDGE] Writing to serial ${path}: ${data.length} bytes`);

    const msg: SystemMessage = {
      id: `hw-serial-write-${Date.now()}`,
      source: 'HARDWARE_BRIDGE',
      target: 'LL007',
      type: 'SERIAL_DATA_SENT',
      payload: { path, length: data.length },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return true;
  }

  /**
   * Buffer sensor reading
   */
  private bufferSensorReading(reading: SensorReading): void {
    this.sensorBuffer.push(reading);
    if (this.sensorBuffer.length > this.maxBufferSize) {
      this.sensorBuffer.shift();
    }
  }

  /**
   * Publish device status change
   */
  private publishDeviceStatus(deviceId: string, status: string): void {
    const device = this.devices.get(deviceId);
    if (!device) return;

    const msg: SystemMessage = {
      id: `hw-status-${Date.now()}`,
      source: 'HARDWARE_BRIDGE',
      target: 'LL090', // GUARDIAN_ANGEL
      type: 'DEVICE_STATUS_CHANGE',
      payload: { deviceId, deviceName: device.name, status },
      timestamp: new Date(),
      priority: status === 'offline' ? 'HIGH' : 'NORMAL'
    };
    globalEventBus.publish(msg);
  }

  /**
   * Get all registered devices
   */
  getDevices(): HardwareDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get devices by type
   */
  getDevicesByType(type: HardwareDevice['type']): HardwareDevice[] {
    return Array.from(this.devices.values()).filter(d => d.type === type);
  }

  /**
   * Get sensor buffer
   */
  getSensorBuffer(limit: number = 100): SensorReading[] {
    return this.sensorBuffer.slice(-limit);
  }

  /**
   * Get GPIO pin states
   */
  getGPIOStates(): GPIOPin[] {
    return Array.from(this.gpioPins.values());
  }

  /**
   * Get serial ports
   */
  getSerialPorts(): SerialPort[] {
    return Array.from(this.serialPorts.values());
  }

  /**
   * Calibrate a sensor
   */
  async calibrateSensor(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device || device.type !== 'sensor') return false;

    device.status = 'calibrating';
    console.log(`[HARDWARE_BRIDGE] Calibrating sensor: ${device.name}`);

    // In production, would run actual calibration
    await new Promise(resolve => setTimeout(resolve, 2000));

    device.status = 'online';
    console.log(`[HARDWARE_BRIDGE] Calibration complete: ${device.name}`);

    const msg: SystemMessage = {
      id: `hw-calibrate-${Date.now()}`,
      source: 'HARDWARE_BRIDGE',
      target: 'LL072', // QUALITY_CONTROL
      type: 'SENSOR_CALIBRATED',
      payload: { deviceId, deviceName: device.name },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return true;
  }

  /**
   * Shutdown hardware bridge
   */
  shutdown(): void {
    // Close all serial ports
    this.serialPorts.forEach(port => {
      port.isOpen = false;
    });

    // Set all GPIO to safe state
    this.gpioPins.forEach(pin => {
      if (pin.mode === 'output') {
        pin.value = 0;
      }
    });

    console.log('[HARDWARE_BRIDGE] Shutdown complete');

    const msg: SystemMessage = {
      id: `hw-shutdown-${Date.now()}`,
      source: 'HARDWARE_BRIDGE',
      target: 'SYSTEM',
      type: 'HARDWARE_BRIDGE_SHUTDOWN',
      payload: { timestamp: new Date() },
      timestamp: new Date(),
      priority: 'HIGH'
    };
    globalEventBus.publish(msg);
  }
}

// Export singleton instance
export const hardwareBridge = new HardwareBridge();