'use strict';


const { ZwaveDevice } = require('homey-zwavedriver');

let oldTemp = -100; // to compare with new temp   in trigger
let newTemp = -100;  // measured temp 

class MyZWaveDevice extends ZwaveDevice {




	async onNodeInit() {
		this.log('MyZWaveDevice has been inited');

		this.node = await this.homey.zwave.getNode(this)

		// jan = await this.configurationGet({index:7})  

		this.enableDebug();
		this.printNode();


		this.node.CommandClass.COMMAND_CLASS_BASIC.BASIC_GET()
			.then(result => {
				if (result['Value']) {
					this.log('Device is turned on');
				} else {
					this.log('Device is turned off');
				}
			})
			.catch(this.error);

		//    this.node.CommandClass.COMMAND_CLASS_CONFIGURATION.CONFIGURATION_GET( {'Parameter Number': 7})
		//    .then(result => {
		// 		if (result) {
		// 		  this.log("result",result);
		// 		} else {
		// 		  this.log('result',result);
		// 		}
		// 	  })
		// 	  .catch(this.error);


		this.log("wait")

		const jil = 3

		this.node.on('online', online => {
			if (online) {
				this.log('Device is online');
			} else {
				this.log('Device is offline');
			}
		});

		this.node.CommandClass.COMMAND_CLASS_BASIC.on('report', (command, report) => {
			this.log('onReport', command, report);
		});




		this.registerCapability('measure_battery', 'BATTERY');

		this.registerCapability('alarm_motion', 'BASIC', {



			report: 'BASIC_REPORT',
			reportParser: report => {
				{
					report['Value'] > 0

					return (report['Value'] > 0)
				}
			},
			getOpts: {
				getOnOnline: true,
				//	pollInterval: 60000
			},


		});


		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL', {

			multiChannelNodeId: 3,
			// 	'command_class': 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			get: 'SENSOR_MULTILEVEL_GET',
			getParser: () => {
				return {
					'Sensor Type': 'Temperature (version 1)',
					'Properties1': {
						'Scale': 1
					}
				}
			},

			report: 'SENSOR_MULTILEVEL_REPORT',
			reportparser: (report, node) => {

				let celsiusTemp

				if (report['Sensor Type'] === 'Temperature (version 1)' &&
					report.hasOwnProperty("Level") &&
					report.Level.hasOwnProperty("Scale") &&
					report.Level.Scale === 1)



					if (node &&
						node.hasOwnProperty('state')) {

						this.log('  node 1  ', util.inspect(node, false, null));
						this.log('  node 1 state ', util.inspect(node.state, false, null));
						this.log('  node 1 dd ', util.inspect(node.device_data, false, null));


						this.log('  node 2 ', util.inspect(node.state, false, null));

						celsiusTemp = Number(((report['Sensor Value (Parsed)'] - 32) / 1.8).toFixed(1))

						//   celsiusTemp = parseFloat(celsiusTemp);

						this.log('celsiustemp  ', celsiusTemp)

						const token = {
							"temp": (report['Sensor Value (Parsed)'] - 32) / 1.8
						};

						this.log('oldTemp', oldTemp);

						newTemp = celsiusTemp

						if (oldTemp !== -100) {

							const consecutiveTemps = { 'oldTemp': oldTemp, 'newTemp': newTemp }


							/* 	Homey.manager('flow').triggerDevice('hms100_lower', null , consecutiveTemps, node.device_data, function (err, result) {
									if (err) return Homey.error(err);
		
		
		
								}); */

						}
						return null
					}

				oldTemp = celsiusTemp;

				return celsiusTemp  //(report['Sensor Value (Parsed)'] - 32) / 1.8   return report['Sensor Value (Parsed)'];

			},

			getOpts: {
				getOnOnline: true,
				//getOnStart: true,
				//pollInterval: 60000
			},
		});


		this.registerCapability('measure_luminance_percentage', 'SENSOR_MULTILEVEL', {

			multiChannelNodeId: 2,
			//'command_class': 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			get: 'SENSOR_MULTILEVEL_GET',
			getParser: () => {
				return {
					'Sensor Type': 'Luminance (version 1)',
					'Properties1': { 'Scale': 0 }
				}
			},

			// version] 5 - 10

			report: 'SENSOR_MULTILEVEL_REPORT',
			reportParser: report => {

				if (report['Sensor Type'] === 'Luminance (version 1)' &&
					report.hasOwnProperty("Level") &&
					report.Level.hasOwnProperty("Scale") &&
					report.Level.Scale === 0) { return report['Sensor Value (Parsed)']; }
				return null

			},






			getOpts: {
				getOnOnline: true,
				//getOnStart: true,
			},
		});




	} // onInitNode

} // app 

module.exports = MyZWaveDevice;
