
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var routes = require('./routes');
var users = require('./routes/users');
var files = require('./routes/files');
var simulator = require('./routes/simulator');

var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Calls
app.get('/', routes.index);

app.post('/tesina/save', files.save);
app.post('/tesina/load', files.load);
app.delete('/tesina/files/:nameUser', files.deleteAllForUser);
app.get('/tesina/files/:nameUser', files.showAllForUser);
app.delete('/tesina/files', files.deleteAll);
app.get('/tesina/files', files.showAll);
app.post('/tesina/makeFile', files.createPhisicalFiles)

app.post('/tesina/createuser', users.create);
app.get('/tesina/viewusers', users.view);
app.get('/tesina/cleanusers', users.clean);

app.post('/tesina/login', users.login);

app.put('/tesina/simulator/start', simulator.startSimulation);
app.post('/tesina/simulator/start', simulator.startSimulation);
app.get('/tesina/simulator/:nameUser/:fileName', simulator.getSimulationValues);
app.put('/tesina/simulator/actuator', simulator.changeStateActuator);
app.get('/tesina/simulator/:nameUser/:fileName/:idDisp', simulator.getSimulationDispositive);


//app.options('/tesina/simulator/sensor/:typesensor', simulator.optionsSensor);
//app.head('/tesina/simulator/sensor/:typesensor', simulator.infoSensor);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
