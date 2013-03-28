var baud_rate = 115200;
var serial = require('serialport');

if (!process.argv || process.argv.length > 3) {
	console.error("Please specify a single parameter, the serial port device file!");
	console.log("One among:");
	serial.list(function(err, result) {
		for (var i in result) {
			console.log(result[i].comName);
		}
		console.log("");
		
		process.exit(1);
	});
} else {
	var serial_port = process.argv[2];
	console.log("Opening Arduino Serial connectio via: ", serial_port,", "+ baud_rate+" baud");


	var SerialPort = serial.SerialPort
	var serialPort = new SerialPort(serial_port, {
		baudrate	: baud_rate,
		parser		: serial.parsers.readline("\n")
	});

	serialPort.on("open", function () {
		console.log('open');
		serialPort.on('data', function (data) {
			//received data from Arduino. Do something here!
			if (data.indexOf("->") == 0) {
				console.log(data.substring(2),"cm");
			} else {
				console.log("ARD_LOG: "data);
			}
		});
	});
}