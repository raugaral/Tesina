
var mongoose = require('mongoose');

//mongoose.connect('mongodb://localhost/tesina_dev');

var SimulationSchema = new mongoose.Schema({
	idUser : String,
	nameFile : String,
	sensors : [{
		idSensor : String,
		typeSensor : String,
		selectedFunction : String,
		readings : [Number]
	}],
	actuators : [{
		idActuator : String,
		state : String
	}]
});

Simulation = mongoose.model('sensors', SimulationSchema);

//******************
exports.startSimulation = function (request, response) {
	response.header("Access-Control-Allow-Origin", "*");
	var user = request.body.idUser;
	var file = request.body.fileName;

	Circuit.find({idUser: user, fileName: file},{__v: 0})
   	.exec(function(err, data){
   		if (data.length > 0) {
   			//response.send(data[0].circuit);
   			circuit = {
   				idUser : user,
   				nameFile : file,
   				sensors : Array(),
   				actuators : Array()
   			};
   			for (var i = 0; i < data[0].circuit.sensors.length; i++) {
   				sensorTemp = { 
   					idSensor : data[0].circuit.sensors[i].attr.id,
   					typeSensor : data[0].circuit.sensors[i].attr.typeDisp,
					selectedFunction : data[0].circuit.sensors[i].attr.selectedFunction,
					readings : Array()
				}
				circuit.sensors.push(sensorTemp);
   			}
   			for (var i = 0; i < data[0].circuit.actuators.length; i++) {
   				actuatorTemp = {
   					idActuator : data[0].circuit.actuators[i].attr.id,
   					state : null
   				}
   				circuit.actuators.push(actuatorTemp);
   			}

   			simulation = new Simulation(circuit);
   			simulation.save(function(err, data){
                if(err){ response.json(420, err); console.log("Start Save! "+simulation.nameFile+" not saved /n"+err);}
                else{ 
                	startMakeValues(simulation);
                	logger("Start Simulacion del circuit: "+file);
   					response.send(200, circuit);}
            });
   		}
    	else response.send(404, "Data not found");
   	});
}

function startMakeValues (simulation) {
	window.setInterval(function () {
		Circuit.find({idUser: user, fileName: file},{__v: 0})
   		.exec(function(err, data){
   			if (data.length > 0) {

   			}
   		});
		//var query = { readings:  };
		//simulation.findOneAndUpdate(query, { name: 'jason borne' });
	}, 1000);

	clearInterval(intervalID);
}


//****** Tuto ******
exports.findAllSensors = function (request, response) {
	return Simulation.find(function (err, sensors) {
	    if (!err) {
	      return response.send(sensors);
	    } else {
	      return console.log(err);
	    }
	});
}

//****** Meu *******
exports.infoSensor = function(request, response){
	response.header("Access-Control-Allow-Origin", "*");

	response.send(200);
}

exports.optionsSensor = function(request, response){
	response.header("Access-Control-Allow-Origin", "*");

	response.header("Allow","HEAD,GET,OPTIONS");

	response.send(200);
}

exports.returnValuesTypeSensor = function(request, response){
	response.header("Access-Control-Allow-Origin", "*");

	var sensor = request.params.typesensor;
	var number;

	switch(sensor){
		case "light" 			: number = Math.round( getRandom(0,1000) ); break;
		case "gas" 				: number = getRandom(0,1); break;
		case "magnetism"		: number = Math.round( getRandom(0,1) ); break;
		case "push" 			: number = Math.round( getRandom(0,1) ); break;
		case "temperature" 		: number = getRandom(-50,50); break;
		case "humedity" 		: number = Math.round( getRandom(0,100) ); break;
		case "water" 			: number = Math.round( getRandom(0,1) ); break;
		case "tilt" 			: number = Math.round( getRandom(0,1) ); break;
		case "motion" 			: number = Math.round( getRandom(0,1) ); break;
		case "flame" 			: number = Math.round( getRandom(0,255) ); break;
		case "sound" 			: number = Math.round( getRandom(0,1023) ); break;
		case "digitaltemperaturec": number = getRandom(-50,50); break;
		case "digitaltemperaturef": number = (getRandom(-50,50)*(9/5))+32; break;
		case "distance" 		: number = Math.round( getRandom(10,80) ); break;
	}

	response.send( number+"" );
}



function getRandom(min, max) {
  	return Math.random() * (max - min) + min;
}

function logger (text) {
	var d = new Date();
	var time = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
	console.log(">>"+time+" - "+text);
}