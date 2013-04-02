/**
 * Sensor object for receiving updates from Salone Arduino sensor.
 * Will process simple events like hand presence, absence, and estimated distance.
 * <br/>
 * If serial connection is not detected, will fire up a simple keypress based
 * emulation mode.
 */
define(['util', 'serialport', 'events'], function (util, serial, events) {

    //if you change this, be sure to change also on Arduino side!
    var baud_rate = 115200;
    var SerialPort = serial.SerialPort;

    //self referencing var. Also known as 'that'.
    var self;

    /**
     * Creates a new Sensor object.
     * Sensor objects are EventEmitter that spit following events:
     * <ul>
     *   <li>'on': a hand is detected in the sensor field of vision</li>
     *   <li>'off': hand is not detected anymore</li>
     *   <li>'distance': hand is at distance passed as data, approximatively in cm</li>
     * </ul>
     *
     * @constructor
     */
    var Sensor = function () {
        self = this;
    };
    util.inherits(Sensor, events.EventEmitter);

    function handSimulator() {
        var fakeHandOn = false;
        // make `process.stdin` begin emitting "keypress" events
        require('keypress')(process.stdin);
        // listen for the "keypress" event
        process.stdin.on('keypress', function (ch, key) {
            if (key && key.name == 'h') {
                self.emit(fakeHandOn ? 'off' : 'on');
                fakeHandOn = !fakeHandOn;
            } else if (key && key.ctrl && key.name == 'c') {
                process.exit();
            }
        });
        process.stdin.setRawMode(true);
        process.stdin.resume();
    };

    /**
     * Connects this node instance to the Arduino via a specified serial port.
     * Sets up connection and handles data.
     *
     * @param serial_port serial port device file path
     */
    Sensor.prototype.connect = function (serial_port) {

        console.log("Opening Arduino Serial via: ", serial_port, ", " + baud_rate + " baud");

        self.serialPort = new SerialPort(serial_port, {
            baudrate: baud_rate,
            parser: serial.parsers.readline("\n")
        });

        self.serialPort.on('error', function (err) {
            if (err.message.indexOf('Cannot open') == 0) {

                console.log("-->Error while opening serial port.");
                console.log("-->Switching to emulation mode...");
                console.log("-->Press 'h' to toggle hand detection.");
                handSimulator();
            } else {
                console.log('SERIAL ERROR ', err);
            }
        });

        var handleData = function (data) {
            //received data from Arduino. Do something here!
            if (data.indexOf("->") == 0) {
                var cmd = data.substring(2);
                if ('ON'.equals(cmd)) {
                    self.emit('on');
                } else if ('OFF'.equals(cmd)) {
                    self.emit('off');
                } else {
                    self.emit('distance', data.substring(2));
                }
            } else {
                //if it doesn't start with ->, then it's not a protocol command
                console.log("_arduinolog_: " + data);
            }
        };

        self.serialPort.on('open', function () {
            console.log('--> Serial OPEN');
            serialPort.on('data', handleData);
        });

        self.serialPort.on('close', function () {
            console.log('<-- Serial CLOSE')
        });
    };

    /**
     * Disconnects the serial port from this node instance.
     * @throws String descriptor if is not connected
     */
    Sensor.prototype.disconnect = function () {
        if (self.serialPort) {
            self.serialPort.close();
            self.serialPort = null;
        } else {
            throw "serial not even connected!";
        }
    }

    /**
     * lists all serial device files available on this machine.
     * Doesn't need to have a serial connection up first
     */
    Sensor.prototype.list = function () {
        serial.list(function (err, result) {
            console.log("--- SERIAL PORTS LIST ---");
            for (var i in result) {
                console.log(result[i].comName);
            }
            console.log("-------------------------");
        });
    }

    return Sensor;
});