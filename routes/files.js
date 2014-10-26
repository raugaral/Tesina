
var fs = require('fs');
var mongoose = require('mongoose');
var jszip = require('jszip');

var CircuitSchema = new mongoose.Schema({
   nameUser : String,
   date : String,
   fileName : String,
   circuit : {
      arduinos : [{ 
         attr : {
            id : String, 
            src : String, 
            height : Number, 
            width : Number, 
            x : Number, 
            y : Number, 
            typeDisp : String, 
            bauds : Number, 
            conn : String, 
            ip : String, 
            port : Number, 
            mac : String}
      }],
      sensors : [{
         attr : {
            id : String,
            src : String,
            height : Number,
            width : Number,
            x : Number,
            y : Number,
            typeDisp : String,
            typeConn : String,
            selectedFunction : String,
            humbral : Number
         }
      }],
      actuators : [{
         attr : {
            id : String,
            typeDisp : String, 
            src : String,  
            height : Number,
            width : Number,
            x : Number, 
            y : Number,
            state : String
         }
      }],
      connections : [{
         from : {idDispositive : String, typeConn : String, idPin : Number },
         to : {idDispositive : String, typeConn : String, idPin : Number}
      }]
   }
});

Circuit = mongoose.model('Circuit', CircuitSchema);


exports.save = function (request, response) {
   var d = new Date();
   var time = d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear();

   response.header("Access-Control-Allow-Origin", "*");
   
   if (!request.body.nameUser || request.body.nameUser.trim().length == 0 || !request.body.fileName || request.body.fileName.trim().length == 0)
      response.send(406); //Conflict
   else{
      circuit = new Circuit(request.body);
      circuit.date = time;
      //console.log(circuit);
      //Busquem si hi ha algun fitxer d'eixe usuari amb eixe nom
      Circuit.find({nameUser: circuit.nameUser, fileName: circuit.fileName},{__v: 0})
      .exec(function(err, data){
         if(data.length > 0 ){ // si existeix l'eliminem
            Circuit.remove({nameUser: circuit.nameUser, fileName: circuit.fileName},
               function (err){
                  if (err){console.log(err); return response.send(500);}
                  else{ // Si s'eliminen be, guardem el nou.
                     circuit.save(function(err, data){
                        if(err){ response.json(420, err); console.log("Save error! "+circuit.fileName+" not saved /n"+err);}
                        else{ response.send(200); console.log(">> circuit "+circuit.fileName+" created by "+circuit.nameUser); }
                     });
                  }
               });
         }
         else{ // si no hi han creats, el creem
            circuit.save(function(err, data){
               if(err){ response.json(420, err); console.log("Save error! "+circuit.fileName+" not saved /n"+err);}
               else{ response.send(200); console.log(">> circuit "+circuit.fileName+" created by "+circuit.nameUser); }
            });
         }
      });
   }
}

exports.load = function (request, response) {
   response.header("Access-Control-Allow-Origin", "*");
   
   user = request.body.user;
   Circuit.find({nameUser: user},{__v: 0})
   .exec(function(err, data){
      if(data.length > 0 ){
         response.send(200, data);
      }
      else{
         response.send(404, "Not found saved circuits.");
      }
   });
}

exports.deleteAllForUser = function (request, response) {
   response.header("Access-Control-Allow-Origin", "*");
   Circuit.remove({nameUser: request.params.nameUser},
      function (err) {
         if (err) response.send(500, err);
         else response.send(200);
      }
   );
}
exports.deleteAll = function (request, response) {
   response.header("Access-Control-Allow-Origin", "*");
   Circuit.remove({},
      function (err) {
         if (err) response.send(500, err);
         else response.send(200);
      }
   );
}

exports.showAllForUser = function (request, response) {
   response.header("Access-Control-Allow-Origin", "*");
   Circuit.find({nameUser: request.params.nameUser},{__v: 0})
   .exec(function(err, data){
      response.send(data);
   });
}
exports.showAll = function (request, response) {
   response.header("Access-Control-Allow-Origin", "*");
   Circuit.find({},{__v: 0})
   .exec(function(err, data){
      response.send(data);
   });
}

exports.createPhisicalFiles = function (request, response) {
   response.header("Access-Control-Allow-Origin", "*");
   user = request.body.nameUser;
   file = request.body.fileName;

   //Creamos los directorios si no existen.
   if( !fs.existsSync('public/files') ){
          fs.mkdirSync('public/files', 0766, true);
   }
   if( !fs.existsSync('public/files/'+user) ){
          fs.mkdirSync('public/files/'+user, 0766, true);
   }

   Circuit.find({nameUser: user, fileName: file},{__v: 0, _id: 0})
   .exec(function(err, data){
      if(data.length > 0 ){
         fs.writeFileSync('public/files/'+user+'/'+file+'.json', JSON.stringify(data));
         
         var zip = new jszip();
         zip.file(file+'.ino', makeMainInoFile(data[0]));
         zip.file('handlers.ino', makeHandlersFile(data[0]));
         //zip.file('splitFunc.ino', fs.readFileSync('public/splitFunc.ino'));
         var buffer = zip.generate({type:"nodebuffer"});
         fs.writeFile('public/files/'+user+'/'+file+'.zip', buffer, function(err) {
            if (err) throw err;
         });

         response.send(200, {'json' : request.headers.host+'/files/'+user+'/'+file+'.json', 'zip' : request.headers.host+'/files/'+user+'/'+file+'.zip'});
         logger('Create File files/'+user+'/'+file+'.json');
      }
      else{
         response.send(404, "Not found saved circuits.");
      }
   });
}

function makeMainInoFile (data) {
   var circuit = data.circuit;

   var comments = "/*\nYou need the TatAmI library\nCan download here:\n";
       comments +="http://www.pros.upv.es/m4spl/tatami/downloads.php\n*/";
   var includes = "\n\n#include <Tatami.h>\n";
       includes +="#include <Wire.h>\n";
       includes +="#include <SPI.h>\n";
       includes +="#include <Ethernet.h>\n";
   var constant = "\n";
   var handlersVar = "\n";
   var declare = "\n";
   var setup = "\nvoid setup(){\n"
   var loop = "\nvoid loop(){\n"
   var handlers = "\n";
   var close = "}\n";

   handlers += "\tSerial.flush();\n";
   handlers += "\tString cadena=comm.readData();\n";
   handlers += "\tchar addressBuffer[20]=\"init\";\n";
   handlers += "\tchar valBuffer[100];\n";
   handlers += "\t//address\n";
   handlers += "\tint i=0;\n";
   handlers += "\twhile(strcmp(addressBuffer,\"\")!=0 && cadena!=\"\"){\n";
   handlers += "\t\tsplitString(cadena, ',',i).toCharArray(addressBuffer, 20);\n";
   handlers += "\t\tsplitString(cadena, ',',i+1).toCharArray(valBuffer, 100);\n";
   handlers += "\t\tdelay(30);\n";
   handlers += "\t\ti=i+2;\n";
   handlers += "\t\tif(strcmp(addressBuffer,\"\")!=0){\n";

   for (var i = 0; i < circuit.arduinos.length; i++) {
      arduinoActual = circuit.arduinos[i].attr;
      setup += "\tSerial.begin("+arduinoActual.bauds+");\n";
      if (arduinoActual.conn.indexOf("Ethernet") >= 0){
         declare += "byte mac"+i+"[] = {0x"+arduinoActual.mac.toUpperCase().replace(/:/g, ", 0x")+"};\n";
         declare += "IPAddress server"+i+"("+arduinoActual.ip.replace(/\./g, ",")+");\n";
         declare += "IPAddress myIP"+i+"("+arduinoActual.ip.replace(/\./g, ",")+");\n";
         declare += "int port"+i+" = "+arduinoActual.port+";\n\n";
         declare += "EthernetClient "+arduinoActual.id+";\n";
         declare += "EthernetCommunication comm;\n";
         setup += "\tcomm.begin(mac"+i+", server"+i+", myIP"+i+", port"+i+");\n";
      }
      else{
         declare += "SerialCommunication comm;\n";
         setup += "\tcomm.begin();\n\n";
      }
   };

   for (var i = 0; i < circuit.sensors.length; i++) {
      sensorActual = circuit.sensors[i].attr;
      constant += "const int "+sensorActual.id+"_PIN = "+searchConnecionPin(circuit, sensorActual.id)+";\n";
      //handlersVar += "char "+sensorActual.id.toUpperCase()+"_ID[] = \""+sensorActual.id+"\";\n";
      declare += sensorActual.typeDisp+" "+sensorActual.id+";\n";
      setup += "\t"+sensorActual.id+".begin("+sensorActual.id+"_PIN);\n";
      
      loop += "\n\tcomm.writeData(\""+sensorActual.typeDisp+" read value is: \\n\",\"\");\n"
      if(sensorActual.selectedFunction.indexOf("threshold") >= 0)
         loop += "\tcomm.writeData("+sensorActual.id+"."+sensorActual.selectedFunction+"("+sensorActual.humbral+")+\"\\n\",\"\");\n";
      else
         loop += "\tcomm.writeData("+sensorActual.id+"."+getFuncionSensor(sensorActual)+"+\"\\n\",\"\");\n";
      
      //handlers += "\t\t\tif(strcmp(addressBuffer, "+sensorActual.id.toUpperCase()+"_ID)==0){\n";
      //handlers += "\t\t\t\thandle"+sensorActual.id+"(valBuffer);\n";
      //handlers += "\t\t\t}\n\n";
   };

   for (var i = 0; i < circuit.actuators.length; i++) {
      actuatorActual = circuit.actuators[i].attr;
      constant += "const int "+actuatorActual.id+"_PIN = "+searchConnecionPin(circuit, actuatorActual.id)+";\n"
      handlersVar += "char "+actuatorActual.id.toUpperCase()+"_ID[] = \""+actuatorActual.id+"\";\n";
      declare += actuatorActual.typeDisp+" "+actuatorActual.id+";\n";
      setup += "\t"+actuatorActual.id+".begin("+actuatorActual.id+"_PIN);\n";
      
      loop += "\n\t"+getFuncionActuator(actuatorActual.typeDisp, 0, actuatorActual.id)+";\n";
      loop += "\t"+"delay(1000);\n";
      loop += "\t"+getFuncionActuator(actuatorActual.typeDisp, 1, actuatorActual.id)+";\n";
      loop += "\t"+"delay(1000);\n";
      
      handlers += "\t\t\tif(strcmp(addressBuffer, "+actuatorActual.id.toUpperCase()+"_ID)==0){\n";
      handlers += "\t\t\t\thandle"+actuatorActual.id+"(valBuffer);\n";
      handlers += "\t\t\t}\n\n";
   };
   handlers += "\t\t}\n";
   handlers += "\t}\n";

   return comments + includes + constant + handlersVar + declare + setup + close + loop + handlers + close;
}

function makeHandlersFile (data) {
   var circuit = data.circuit;
   var text = "";

   for (var i = 0; i < circuit.actuators.length; i++) {
      actuatorActual = circuit.actuators[i].attr;
      text += "void handle"+actuatorActual.id+" (char valueBuffer[]){\n";
      text += "\tif(strcmp(valueBuffer, \"true\")==0){\n";
      text += "\t\tdigitalWrite("+actuatorActual.id+"_PIN, HIGH);\n";
      text += "\t} else {\n";
      text += "\t\tdigitalWrite("+actuatorActual.id+"_PIN, LOW);\n";
      text += "\t}\n";
      text += "}\n";
   }

   return text;
}

/**
* save a json on a file
*/
exports.saveOnFile = function(request, response){
   user = request.body.user;
   file = request.body.filename;
   json = request.body.shapes;
   
   if( !fs.existsSync('save') ){
          fs.mkdirSync('save', 0766, true);
   }
   if( !fs.existsSync('save/'+user) ){
          fs.mkdirSync('save/'+user, 0766, true);
   //console.log('directorio save/'+user+' creado!');
   }
   fs.writeFileSync('save/'+user+'/'+file+'.json', JSON.stringify(json));
   response.header("Access-Control-Allow-Origin", "*");
   response.send("Done! The file was saved!\n");
   logger('Create File save/'+user+'/'+file+'.json');
}

/**
* response a json object with the files
*/
exports.loadOnFile = function(request, response){
   user = request.body.user;
   if( !fs.existsSync('save/'+user) ){
   //console.log('POST / load - No encontrado '+user);
      response.header("Access-Control-Allow-Origin", "*");
      response.send(404, 'ERROR! The user '+user+' not exist!');
   }
   else{
      files = fs.readdirSync('save/'+user)
      jsonResp = {nameFiles: files};
      
      for(i = 0; i < files.length; i++){
         dataFile = JSON.parse(fs.readFileSync('save/'+user+'/'+files[i]));
         jsonResp[files[i]] = dataFile;
         //console.log(jsonResp[files[i]]);
      }
      
      logger('POST / load archivos de '+user);
      //console.log(jsonResp);
      response.header("Access-Control-Allow-Origin", "*");
      response.send(200, jsonResp);
   }
}


//*************************
function searchConnecionPin (circuit, sensor) {
   for (var i = 0; i < circuit.connections.length; i++) {
      if(circuit.connections[i].from.idDispositive.indexOf(sensor) >= 0)
         return circuit.connections[i].to.idPin;
      else if(circuit.connections[i].to.idDispositive.indexOf(sensor) >= 0)
         return circuit.connections[i].from.idPin;
   };
}

function getFuncionActuator(typeDisp, pos, ActuarotId) {
   var type = "";
   switch(typeDisp.toUpperCase()){
      case "RELAYACTUATOR"    : if(pos == 0) type = ActuarotId+".openRelay()"; else type = ActuarotId+".closeRelay()"; break;
      case "BUZZACTUATOR"   : if(pos == 0) type = ActuarotId+".playWithBuzzIntensity(500, 1000)"; else type = ActuarotId+".playWithBuzzIntensity(1000, 1000)"; break;
      case "SERVOACTUATOR"    : if(pos == 0) type = "for(pos = 0; pos < 180; pos += 1){ "+ActuarotId+".write(pos);delay(15);}"; else type = "for(pos = 180; pos >= 1; pos -= 1){ "+ActuarotId+".write(pos);delay(15);}"; break;
   }

   return type;
}

function getFuncionSensor(sensor) {
   var type = "";
   switch(sensor.typeDisp.toUpperCase()){
      case 'SMOKESENSOR'   : type = "MQGetGasPercentage("+sensor.id+".MQRead(),"+sensor.selectedFunction+")"; break;
      default : type = sensor.selectedFunction+"()";
   }

   return type;
}

function logger (text) {
   var d = new Date();
   var time = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
   console.log(">>"+time+" - "+text);
}
