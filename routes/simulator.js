
var mongoose = require('mongoose');

var startedSimulations = Array();

//******************
exports.startSimulation = function (request, response) {
	response.header("Access-Control-Allow-Origin", "*");
	var nameUser = request.body.nameUser;
	var file = request.body.fileName;
	var state = request.body.state;
	
	Circuit.find({nameUser: nameUser, fileName: file},{__v: 0})
   	.exec(function(err, data){
   		if (err) {response.send(500, "Errors found while search the stored circuit: "+err);}
   		if (data.length > 0) {
   			if(state == "true"){
	   			simulation = {state : true, data : data};
	   			startedSimulations.push(simulation);
	   			response.send(200, "Simulation Started!");
	   			logger("Start Simulacion del circuit: "+file);
   			}
   			else{
   				for (var i = 0; i < startedSimulations.length; i++) {
			        if(startedSimulations[i].data[0].nameUser == data[0].nameUser){ 
			            startedSimulations.splice(i,1);
			            response.send(200, "Simulation Stopped!");
   						logger("Stop Simulacion del circuit: "+file);
			            break;
			        }
			    }
   				response.send(500, "Can't stop the Simulation.");
   			}
   		}
   		else response.send(404, "Data not found.");
   	});
}

exports.getSimulationValues = function (request, response) {
	response.header("Access-Control-Allow-Origin", "*");
	var user = request.params.nameUser;
	var file = request.params.fileName;

	simulation = searchSimulation(user, file);
	simulationData = Array();

	//debugger;
    //Creem els valors per als dispositius
    for (var i = 0; simulation != null && i < simulation.sensors.length; i++) {
    	idSens = simulation.sensors[i].attr.id;
    	typeSensor = simulation.sensors[i].attr.typeDisp;
    	selectFunc = simulation.sensors[i].attr.selectedFunction;
    	threshold = simulation.sensors[i].attr.humbral;
    	//console.log({TypeSensor: typeSensor, Func: selectFunc, Threshold : threshold});
    	value = getSensorValue(typeSensor, selectFunc, threshold);
    	typeValue = getTipeSensorValue(typeSensor, selectFunc);
    	//console.log(JSON.stringify({idSens : value}));
    	simulationData.push({idSensor : idSens, value : value, typeValue : typeValue});
    	//console.log({idSensor : idSens, value : value, typeValue : typeValue});
    };
    for (var i = 0; simulation != null && i < simulation.actuators.length; i++) {
    	idActuat = simulation.actuators[i].attr.id;
    	value = simulation.actuators[i].attr.state;
    	//console.log(JSON.stringify({idActuat : value}));
    	simulationData.push({idSensor : idActuat, value : value});
    };

    if (simulationData.length > 0)
		response.send(simulationData);
	else
		response.send(404);
}

exports.changeStateActuator = function (request, response) {
	response.header("Access-Control-Allow-Origin", "*");
	var user = request.body.nameUser;
	var file = request.body.fileName;
	var state = request.body.state;
	var actuator = request.body.idActuator;
	//console.log(user+" - "+file+" - "+actuator+" - "+state);
	simulation = searchSimulation(user, file);

    for (var i = 0; simulation != null && i < simulation.actuators.length; i++) {
    	if(simulation.actuators[i].attr.id == actuator){
    		simulation.actuators[i].attr.state = state;
    		response.send(200, simulation.actuators[i]);
    	}
    };
    response.send(404);
}

exports.getSimulationDispositive = function (request, response) {
	response.header("Access-Control-Allow-Origin", "*");
	var user = request.params.nameUser;
	var file = request.params.fileName;
	var idDisp = request.params.idDisp;

	simulation = searchSimulation(user, file);
	for (var i = 0; simulation != null && i < simulation.sensors.length; i++) {
    	if(simulation.sensors[i].attr.id == actuator){
    		simulation.sensors[i].attr.state = state;
    		response.send(200, simulation.sensors[i]);
    	}
    };
    for (var i = 0; simulation != null && i < simulation.actuators.length; i++) {
    	if(simulation.actuators[i].attr.id == actuator){
    		simulation.actuators[i].attr.state = state;
    		response.send(200, simulation.actuators[i]);
    	}
    };
}

exports.infoSensor = function(request, response){
	response.header("Access-Control-Allow-Origin", "*");

	response.send(200);
}

exports.optionsSensor = function(request, response){
	response.header("Access-Control-Allow-Origin", "*");

	response.header("Allow","HEAD,GET,OPTIONS");

	response.send(200);
}


function getSensorValue(typeSensor, selFunc, threshold){
	var number;
console.log(typeSensor);
	switch(typeSensor.toUpperCase()){
		case "LIGHTSENSOR" 				: number = Math.round( getRandom(0,1000) ); if (threshold && number >= threshold) number = true; else if (threshold && number < threshold) number = false; break;
		case "GASSENSOR" 				: number = getRandom(0,1); break;
		case "SMOKESENSOR" 				: number = getRandom(0,1); break;
		case "MAGNETSENSOR"				: number = Math.round( getRandom(0,1) ); break;
		case "PUSHSENSOR" 				: number = Math.round( getRandom(0,1) ); break;
		case "TEMPHUMISENSOR" 			: if(selFunc.indexOf("Temp") >= 0) number = getRandom(-50,50); else number = Math.round( getRandom(0,100) ); break;
		case "WATERSENSOR" 				: number = Math.round( getRandom(0,1) ); break;
		case "TILTSENSOR" 				: number = Math.round( getRandom(0,1) ); break;
		case "MOTIONSENSOR" 			: number = Math.round( getRandom(0,1) ); break;
		case "FLAMESENSOR" 				: number = Math.round( getRandom(0,255) ); break;
		case "ANALOGSOUNDSENSOR" 		: number = Math.round( getRandom(0,1023) ); break;
		case "DIGITALTEMPERATURESENSOR" : if(selFunc.indexOf("Cels") >= 0) number = getRandom(-50,50); else number = (getRandom(-50,50)*(9/5))+32; break;
		case "PROXIMITYSENSOR" 			: number = Math.round( getRandom(10,80) ); break;
	}

	return number;
}
function getRandom(min, max) {
  	return Math.random() * (max - min) + min;
}

function getTipeSensorValue (typeSensor, selFunc) {
	var type;

	switch(typeSensor.toUpperCase()){
		case "LIGHTSENSOR" 				: type = "Luxes"; break;
		case "GASSENSOR" 				: type = "Particles per milion"; break;
		case "SMOKESENSOR"				: type = "Particles per milion"; break;
		case "MAGNETSENSOR"				: type = "1 when close to a magnet, 0 when not"; break;
		case "PUSHSENSOR" 				: type = "1 when pushed, 0 when not"; break;
		case "TEMPHUMISENSOR" 			: if(selFunc.indexOf("Temp") >= 0)type = "ºC temperature"; else type = "% humidity"; break;
		case "WATERSENSOR" 				: type = "0 if water 1 if not"; break;
		case "TILTSENSOR" 				: type = "1 if tilt 0 if not"; break;
		case "MOTIONSENSOR" 			: type = "1 if movement 0 if not"; break;
		case "FLAMESENSOR" 				: type = "Between 0 and 255"; break;
		case "ANALOGSOUNDSENSOR" 		: type = "Between 0 and 1023"; break;
		case "DIGITALTEMPERATURESENSOR" : if(selFunc.indexOf("Cels") >= 0) type = "Float with Celsius"; else type = "Float with Fahrenheit"; break;
		case "PROXIMITYSENSOR" 			: type = "Centimeters"; break;
	}

	return type;
}

function logger (text) {
	var d = new Date();
	var time = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
	console.log(">>"+time+" - "+text);
}

function searchSimulation (user, file) {
	//Busquem la simulacio demanada
	for (var i = 0; startedSimulations != null && i < startedSimulations.length; i++) {
		if(startedSimulations[i].data[0].nameUser == user && 
			startedSimulations[i].data[0].fileName == file){ 
            	return startedSimulations[i].data[0].circuit;
        	}
    }
}