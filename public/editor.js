window.onload = function() {
    var dragger = function() {
        this.ox = this.type == "rect" ? this.attr("x") : this.attr("cx");
        this.oy = this.type == "rect" ? this.attr("y") : this.attr("cy");
        this.animate({"fill-opacity": .2}, 500);
    }, 
    move = function(dx, dy) {
        var att = this.type == "rect" ? {x: this.ox + dx,y: this.oy + dy} : {cx: this.ox + dx,cy: this.oy + dy};
        this.attr(att);
        for (var i = connections.length; i--; ) {
            r.connection(connections[i]);
        }
        r.safari();
    }, 
    up = function() {
        this.animate({"fill-opacity": 0}, 500);
    }, 
    r = Raphael("canvas");

    this.paper = r;
    this.shapes = Array();
    this.connections = Array();
    this.contId = 1000;
    
    this.functionsOfSensors = {
        'LightSensor':['getLightValue','thresholdCrossed'],
        'MagnetSensor':['getMagnetValue'],
        'GasSensor':['getGasPercentageGAS_SMOKE','getGasPercentageGAS_CO','getGasPercentageGAS_LPG'],
        'SmokeSensor':['GAS_SMOKE','GAS_CO','GAS_LPG'], 
        'TempHumiSensor':['getHumiValue','getTempValue'],
        'WaterSensor':['getWaterValue'],
        'TiltSensor':['getTiltValue'],
        'MotionSensor':['getMotionValue'],
        'FlameSensor':['getFlameValue','thresholdCrossed'],
        'AnalogSoundSensor':['getSoundValue','thresholdCrossed'],
        'DigitalTemperatureSensor':['getTemperatureCelsius','getTemperatureFahrenheit'],
        'wiretempSensor':['getTemperatureCelsius'],
        'ProximitySensor':['getDistanceValue'],
        'PushButton':['getButtonPushed']
    }
    this.simulateOn = false;
    this.intervalSeconds = 20;
};

function clearPaper(){
    paper.clear();
    this.shapes = [];
    this.connections = [];
    circuit = {};
    this.contId = 1000;
}

function makeArduinoUno(x, y, id, bauds, conn, ip, port, mac ){
    //Creamos la imagen del arduino
    if(!x) x = 210;
    if(!y) y = 80;
    var arduino = paper.image("img/arduino_uno.png", x, y, 350, 250);
    arduino.type = "arduino_uno";
    if(!id) arduino.id = "arduinoUno_"+contId++;
    else arduino.id = id;
    if(!bauds) arduino.bauds = 9600;
    else arduino.bauds = bauds;
    if(!conn) arduino.conn = "Serie";
    else arduino.conn = conn;
    if(ip) arduino.ip = ip;
    if(port) arduino.port = port;
    if(mac) arduino.mac = mac;

    arduino.mousedown( function(){ contextMenu(); } );
    arduino.dblclick( function(){ doubleClick(arduino); } );
    //Creamos todos los conectores digitales
    this.conDigital = new Array(14);
    for (var i = 0; i < conDigital.length; i++) {
        conDigital[i] = paper.ellipse((x+328)-(13*i), y+10, 6, 6)
                                .attr({"fill-opacity": 1, fill: "#808080"})
                                .data("name","digital");
        conDigital[i].parent = arduino;
        conDigital[i].typeConn = "Digital";
        conDigital[i].idIntern = i;
    };
    //Creamos todos los conectores Analogicos
    this.conAnalog = new Array(6);
    for (var i = 0; i < conAnalog.length; i++) {
        conAnalog[i] = paper.ellipse((x+264)+(13*i), y+240, 6, 6)
                                .attr({"fill-opacity": 1, fill: "#808080"})
                                .data("name","analogic");
        conAnalog[i].parent = arduino;
        conAnalog[i].typeConn = "Analog";
        conAnalog[i].idIntern = i;
    };

    arduino.connDig = conDigital;
    arduino.connAna = conAnalog;
    
    //Damos movimiento a la imagen del arduino
    setMove(arduino);
    
    //Hacemos que los conectores se muevan con la imagen del arduino
    for (var i = 0; i < conDigital.length; i++) {
        setFollower(arduino,conDigital[i]);
    };
    for (var i = 0; i < conAnalog.length; i++) {
        setFollower(arduino,conAnalog[i]);
    };

    //Hacemos que podamos conectar los conectores
    for (var i = 0; i < conDigital.length; i++) {
        setConnectable(conDigital[i]);
    };
    for (var i = 0; i < conAnalog.length; i++) {
        setConnectable(conAnalog[i]);
    };

    //Añadimos los objetos al tapiz
    shapes.push(arduino);
    /*for (var i = 0; i < conDigital.length; i++) {
        shapes.push(conDigital[i]);
    };
    for (var i = 0; i < conAnalog.length; i++) {
        shapes.push(conAnalog[i]);
    };*/

    return arduino;
}

function makeArduinoMega(x, y, id, bauds, conn, ip, port, mac){
    if(!x) x = 210;
    if(!y) y = 80;

    //Creamos la imagen del arduino
    var arduino = paper.image("img/arduino_mega.png", x, y, 480, 250);
    arduino.type = "arduino_mega";
    if(!id) arduino.id = "arduinoMega_"+contId++;
    else arduino.id = id;
    if(!bauds) arduino.bauds = 9600;
    else arduino.bauds = bauds;
    if(!conn) arduino.conn = "Serie";
    else arduino.conn = conn;
    if(ip) arduino.ip = ip;
    if(port) arduino.port = port;
    if(mac) arduino.mac = mac;

    //Añadimos la funcion doble click y boton derecho 
    arduino.mousedown( function(){ contextMenu(); } );
    arduino.dblclick( function(){ doubleClick(arduino); } );

    //Creamos todos los conectores digitales
    this.conDigital = new Array(32);
    for (var i = 0, cont = 0; i < conDigital.length/2; i++) {
        for (var j = 1; j <= 2; j++) {
            conDigital[cont] = paper.ellipse((x+436)+(12*j), (y+20)+(12*i), 5, 5)
                                        .attr({"fill-opacity": 1, fill: "#808080"})
                                        .data("name","digital");
            conDigital[cont].parent = arduino;
            conDigital[cont].typeConn = "Digital";
            conDigital[cont].idIntern = cont;
            conDigital[cont++].id = contId++;
        }

    };
    //Creamos todos los conectores Analogicos
    this.conAnalog = new Array(16);
    for (var i = 0; i < conAnalog.length; i++) {
        conAnalog[i] = paper.ellipse((x+255)+(12*i), y+240, 5, 5)
                                .attr({"fill-opacity": 1, fill: "#808080"})
                                .data("name","analogic");
        conAnalog[i].parent = arduino;
        conAnalog[i].typeConn = "Analog";
        conAnalog[i].idIntern = i;
        conAnalog[i].id = contId++;
    };

    arduino.connDig = conDigital;
    arduino.connAna = conAnalog;
    
    //Damos movimiento a la imagen del arduino
    setMove(arduino);
    
    //Hacemos que los conectores se muevan con la imagen del arduino
    for (var i = 0; i < conDigital.length; i++) {
        setFollower(arduino,conDigital[i]);
    };
    for (var i = 0; i < conAnalog.length; i++) {
        setFollower(arduino,conAnalog[i]);
    };

    //Hacemos q podamos conectar los conectores
    for (var i = 0; i < conDigital.length; i++) {
        setConnectable(conDigital[i]);
    };
    for (var i = 0; i < conAnalog.length; i++) {
        setConnectable(conAnalog[i]);
    };

    //Añadimos los objetos al tapiz
    shapes.push(arduino);
    /*for (var i = 0; i < conDigital.length; i++) {
        shapes.push(conDigital[i]);
    };
    for (var i = 0; i < conAnalog.length; i++) {
        shapes.push(conAnalog[i]);
    };*/

    return arduino;
}

function makeLightSensor(){
    makeSensor(40, 110, null, null, 'LightSensor', 'img/light_sensor.png', 'Analog');
}
function makeMagneticSensor(){
    makeSensor(60, 100, null, null, 'MagnetSensor', 'img/magnetic_sensor.png', 'Digital');
}
function makeGasSensor(){
    makeSensor(60, 100, null, null, 'SmokeSensor', 'img/gas_sensor.png', 'Analog');
}
function makeHumiTempSensor(){
    makeSensor(60, 100, null, null, 'TempHumiSensor', 'img/Hum&Temp_sensor.png', 'Analog');
}
function makeWaterSensor(){
    makeSensor(60, 100, null, null, 'WaterSensor', 'img/water_sensor.png', 'Digital');
}
function makeTiltSensor(){
    makeSensor(60, 100, null, null, 'TiltSensor', 'img/tilt_sensor.png', 'Digital');
}
function makeMotionSensor(){
    makeSensor(60, 100, null, null, 'MotionSensor', 'img/motion_sensor.png', 'Digital');
}
function makeFlameSensor(){
    makeSensor(60, 100, null, null, 'FlameSensor', 'img/flame_sensor.png', 'Analog');
}
function makeSoundSensor(){
    makeSensor(60, 100, null, null, 'AnalogSoundSensor', 'img/sound_sensor.png', 'Analog');
}
function makeDigTempSensor(){
    makeSensor(60, 100, null, null, 'DigitalTemperatureSensor', 'img/digitalTemp_sensor.png', 'Digital');
}
function makeWireTempSensor(){
    makeSensor(60, 100, null, null, 'wiretempSensor', 'img/wireTemp_sensor.png', 'Digital');
}
function makeDistanceSensor(){
    makeSensor(60, 100, null, null, 'ProximitySensor', 'img/distance_sensor.png', 'Analog');
}
function makePushSensor(){
    makeSensor(80, 60, null, null, 'PushButton', 'img/push_sensor.png', 'Digital');
}
function makeSensor(width, height, x, y, nameType, img, typeConn, id, selFunc, hum){
    if(!width) width = 40;
    if(!height) height = 110;
    if(!x) x = 350;
    if(!y) y = 130;
    
    //Creamos la imagen del sensor 
    var sensor = paper.image(img, x, y, width, height);
    sensor.type = nameType;
    sensor.typeConn = typeConn;
    sensor.functions = getFunctionsOfSensor(nameType);
    sensor.id = nameType+"_"+contId++;
    if(id) sensor.id = id;
    if(!selFunc) sensor.selectedFunction = getFunctionsOfSensor(sensor.type)[0];
    else sensor.selectedFunction = selFunc;
    if(hum)  sensor.humbral = hum;

    //Añadimos funcion doble click y menu contextual
    sensor.mousedown( function(){ contextMenu(); } );
    sensor.dblclick( function(){ doubleClick(sensor); } );
    
    //Damos moviemiento al sensor
    setMove(sensor);
    
    //Creamos el conector
    connSens = paper.ellipse(x+(width/2), y+height, 6, 6)
                        .attr({"fill-opacity": 1, fill: "#808080"})
                        .data("name",nameType);
    connSens.parent = sensor;
    connSens.id = contId++;
    connSens.typeConn = typeConn;
    sensor.conn = connSens;
    
    //hacemos que el conector se mueva con sensor
    setFollower(sensor, connSens);
    
    //hacemos conectable el conector 
    setConnectable(connSens);
    
    //Añadimos el sensor y el conector a las variables globales
    shapes.push(sensor);
    //shapes.push(connSens);
    
    return sensor;
}


function makeRelayActuator(){
    makeActuator(65, 70, null, null, 'RelayActuator', 'img/relay_actuator.png')
}
function makeBuzzerActuator(){
    makeActuator(60, 70, null, null, 'BuzzActuator', 'img/buzz_actuator.png')
}
function makeServoActuator(){
    makeActuator(60, 70, null, null, 'ServoActuator', 'img/servo_actuator.png')
}
function makeActuator (width, height, x, y, nameType, img, state, id) {
    if(!width) width = 40;
    if(!height) height = 110;
    if(!x) x = 450;
    if(!y) y = 130;
    
    //Creamos la imagen del actuator 
    var actuator = paper.image(img, x, y, width, height);
    if(nameType) actuator.type = nameType; else actuator.type = "Actuator";
    //actuator.typeConn = typeConn;
    //actuator.functions = getFunctionsOfactuator(nameType);
    //actuator.selectedFunction = null;
    actuator.id = nameType+"_"+contId++;
    if(id) actuator.id = id;
    if(state) actuator.status = state; else actuator.status = false;

    actuator.mousedown( function(){ contextMenu(); } );
    actuator.dblclick( function(){ doubleClick(actuator); } );
    
    //Damos moviemiento al actuator
    setMove(actuator);
    
    //Creamos el conector
    connActuator = paper.ellipse(x+(width/2), y+height, 6, 6)
                            .attr({"fill-opacity": 1, fill: "#808080"})
                            .data("name",nameType);
    connActuator.parent = actuator;
    connActuator.id = contId++;
    actuator.conn = connActuator;
    
    //hacemos que el conector se mueva con actuator
    setFollower(actuator, connActuator);
    
    //hacemos conectable el conector 
    setConnectable(connActuator);
    
    //Añadimos el actuator y el conector a las variables globales
    shapes.push(actuator);
    //shapes.push(connActuator);
    
    return actuator;
}


function getFunctionsOfSensor(type){
    switch(type){
        case 'LightSensor': return functionsOfSensors.LightSensor; 
        case 'MagnetSensor' : return functionsOfSensors.MagnetSensor;
        case 'GasSensor' : return functionsOfSensors.GasSensor;
        case 'SmokeSensor' : return functionsOfSensors.SmokeSensor;
        case 'TempHumiSensor' : return functionsOfSensors.TempHumiSensor;
        case 'WaterSensor' : return functionsOfSensors.WaterSensor;
        case 'TiltSensor' : return functionsOfSensors.TiltSensor;
        case 'MotionSensor' : return functionsOfSensors.MotionSensor;
        case 'FlameSensor' : return functionsOfSensors.FlameSensor;
        case 'AnalogSoundSensor' : return functionsOfSensors.AnalogSoundSensor;
        case 'DigitalTemperatureSensor' : return functionsOfSensors.DigitalTemperatureSensor;
        case 'wiretempSensor' : return functionsOfSensors.wiretempSensor;
        case 'ProximitySensor' : return functionsOfSensors.ProximitySensor;
        case 'PushButton' : return functionsOfSensors.PushButton;
    }
}

function removeShape(shape){
    var modif = false;
    //Eliminamos la conexion
    for (var i = 0; i < connections.length; i++) {
        if(connections[i].from.parent == shape){
            connections[i].from.remove();
            connections[i].to.attr("fill","#808080");
            modif = true;
        }
        else if(connections[i].to.parent == shape){
            connections[i].to.remove();
            connections[i].from.attr("fill","#808080");
            modif = true;
        }
        if(modif){//Esto es para no repetir codigo
            connections[i].bg.node.remove(); //Eliminamos la linea de conexion
            connections[i].line.remove(); //Eliminamos la linea de conexion
            connections.splice(i,1);//Eliminamos la conexion del array
            i--; //Triamos un paso atras porqu ahora hay un elemento menos
            modif = false;
        }
    };
    //Eliminamos las conexiones
    if(shape.type.indexOf("arduino") >= 0){
        for (var i = 0; i < shape.connAna.length; i++) {
            shape.connAna[i].remove();
        };
        for (var i = 0; i < shape.connDig.length; i++) {
            shape.connDig[i].remove();
        };
    }
    else{
        shape.conn.remove();
    }

    

    for (var i = 0; i < shapes.length; i++) {
        if(shapes[i] == shape){ 
            shapes.splice(i,1);
            shape.remove();
            break;
        }
    }
}
function removeConn(conn){
    conn.to.attr("fill","#808080");
    conn.from.attr("fill","#808080");
    conn.bg.remove();
    conn.line.remove();
}

function setMove(shape){
    var dragger = function() {
        this.ox = this.type != "ellipse" ? this.attr("x") : this.attr("cx");
        this.oy = this.type != "ellipse" ? this.attr("y") : this.attr("cy");
        //this.animate({"fill-opacity": .5,"stroke-opacity": .5}, 500);
    }, 
    move = function(dx, dy) {
        var att = this.type != "ellipse" ? {x: this.ox + dx,y: this.oy + dy} : {cx: this.ox + dx,cy: this.oy + dy};
        this.attr(att);
        for (var i = connections.length; i--; ) {
            paper.connection(connections[i]);
        }
        paper.safari();
    }, 
    up = function() {
        //this.animate({"fill-opacity": 0,"stroke-opacity": 1}, 500);
    };
    shape.attr({fill: "#fff","fill-opacity": 0,"stroke-width": 2,cursor: "move"});
    shape.drag(move, dragger, up);
}

function setFollower(shape, follower){
    var dragger = function() {
        follower.ox = follower.type != "ellipse" ? follower.attr("x") : follower.attr("cx");
        follower.oy = follower.type != "ellipse" ? follower.attr("y") : follower.attr("cy");
    }, 
    move = function(dx, dy) {
        var att = follower.type != "ellipse" ? {x: follower.ox + dx,y: follower.oy + dy} : {cx: follower.ox + dx,cy: follower.oy + dy};
        follower.attr(att);
        /*for (var i = connections.length; i--; ) {
            paper.connection(connections[i]);
        }*/
    }, 
    up = function() {
        paper.safari();
        //follower.animate({"fill-opacity": 1}, 300);
    };
    shape.drag(move, dragger, up);
}

function setConnectable(shape){
    var gris = "#808080", verd = "#00FF00";
    this.obj1 = null, this.obj2 = null;

    var click = function(){
        if( this.attr("fill") == verd ){//Desenchufamos
            this.animate({fill: gris}, 1000);
            if(obj1 == this) obj1 = null;
            else if(obj2 == this) obj2 = null;
        }else if( this.attr("fill") == gris ){//Enchufamos
            this.animate({fill: verd}, 500);
            if(obj1 == null) obj1 = this;
            else if(obj2 == null) obj2 = this;
        }
        if(obj1 != null && obj2 != null){
            connect(obj1, obj2);
        }
    }

    shape.click(click);
}

function connect(objFrom, objTo){
    var groc = "#FFF500";
    conn = paper.connection(objFrom, objTo, "#000", "3");
    connections.push(conn);

    conn.line.mousedown( function(){ contextMenuConn(); } );
    conn.bg.mousedown( function(){ contextMenuConn(); } );
    
    connections[connections.length-1].bg.id = null;

    objFrom.animate({fill: groc}, 500);
    objTo.animate({fill: groc}, 500);

    this.obj1 = null, this.obj2 = null;
}

Raphael.fn.connection = function(obj1, obj2, line, bg) {
    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    }
    var bb1 = obj1.getBBox(), 
    bb2 = obj2.getBBox(), 
    p = [{x: bb1.x + bb1.width / 2,y: bb1.y - 1}, 
        {x: bb1.x + bb1.width / 2,y: bb1.y + bb1.height + 1}, 
        {x: bb1.x - 1,y: bb1.y + bb1.height / 2}, 
        {x: bb1.x + bb1.width + 1,y: bb1.y + bb1.height / 2}, 
        {x: bb2.x + bb2.width / 2,y: bb2.y - 1}, 
        {x: bb2.x + bb2.width / 2,y: bb2.y + bb2.height + 1}, 
        {x: bb2.x - 1,y: bb2.y + bb2.height / 2}, 
        {x: bb2.x + bb2.width + 1,y: bb2.y + bb2.height / 2}],
    d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x), 
            dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x, 
    y1 = p[res[0]].y, 
    x4 = p[res[1]].x, 
    y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3), 
    y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3), 
    x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3), 
    y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    if (line && line.line) {
        line.bg && line.bg.attr({path: path});
        line.line.attr({path: path});
    } else {
        var color = typeof line == "string" ? line : "#000";
        return {
            bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0],fill: "none","stroke-width": bg.split("|")[1] || 3}),
            line: this.path(path).attr({stroke: color,fill: "none"}),
            from: obj1,
            to: obj2
        };
    }
}


function save(file, name_user){
    if (file.trim().length > 0) {
        jsonCircuit = makeJSONcircuit();
        json = { nameUser : name_user, fileName : file, circuit : jsonCircuit };
        
        $.post( "http://127.0.0.1:3001/tesina/save", json, "json")
        .done(function(data){
            $("#nmAlert h4").html("Saved correctly!");
            $("#nmAlert").addClass("in");
            window.setTimeout(function() { $("#nmAlert").removeClass("in"); }, 2000);
            sessionStorage.setItem("fileName",file);
        })
        .fail(function(data){
            bootbox.alert("<b style='color: red'>Save Error!</b>")
            console.error(data.responseText);
        });
    }
}
function silentSave(file, name_user){
    jsonCircuit = makeJSONcircuit();
    json = { nameUser : name_user, fileName : file, circuit : jsonCircuit };
    $.ajax({
        async: false,
        type: "POST",
        url: "http://127.0.0.1:3001/tesina/save",
        data: json
    });
    //$.post( "http://127.0.0.1:3001/tesina/save", json, "json");
}
function makeJSONcircuit () {
    circuit = {
        arduinos : [],
        sensors : [],
        actuators : [],
        connections : []
    };
    
    for (i = 0; i < shapes.length; i++){
        shape = shapes[i];
        if (shape.type.indexOf("arduino") >= 0) {
            circuit.arduinos.push({
                attr : {
                    id : shape.id,
                    typeDisp : shape.type,
                    bauds : shape.bauds,
                    conn : shape.conn,
                    ip : shape.ip,
                    port : shape.port,
                    mac : shape.mac,
                    src : shape.attrs.src,
                    width : shape.attrs.width,
                    height : shape.attrs.height,
                    x : shape.attrs.x,
                    y : shape.attrs.y
                }
            });
        }
        else if (shape.type.indexOf("Sensor") >= 0) {
            circuit.sensors.push({
                attr : {
                    id : shape.id,
                    typeDisp : shape.type,
                    selectedFunction : shape.selectedFunction,
                    humbral : shape.humbral,
                    typeConn : shape.typeConn,
                    src : shape.attrs.src,
                    width : shape.attrs.width,
                    height : shape.attrs.height,
                    x : shape.attrs.x,
                    y : shape.attrs.y
                }
            });
        }
        else if (shape.type.indexOf("Actuator") >= 0) {
            circuit.actuators.push({
                attr : {
                    id : shape.id,
                    typeDisp : shape.type,
                    state : shape.status,
                    src : shape.attrs.src,
                    width : shape.attrs.width,
                    height : shape.attrs.height,
                    x : shape.attrs.x,
                    y : shape.attrs.y
                }
            });
        }
    }

    for (i = 0; i < connections.length; i++){
        conn = connections[i];
        circuit.connections.push({
            from : {
                idDispositive : conn.from.parent.id,
                typeConn : conn.from.typeConn,
                idPin : conn.from.idIntern},
            to : {
                idDispositive : conn.to.parent.id,
                typeConn : conn.to.typeConn,
                idPin : conn.to.idIntern}
        });
    }

    return circuit;
}

function load(){
    nameUser = getNameUser();
    
    if(nameUser){
        $.ajax({
            url: "http://127.0.0.1:3001/tesina/files/"+nameUser,
            type: "GET"
        })
        .done(function(data) {
            window.savedCircuits = data;
            boxLoad(data);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error(textStatus+' '+errorThrown+': ' + jqXHR.responseText);
            boxLoad([]);
        });
    }
    else
        $("#loginbox").modal("show");
}

function import_shapes(nameCircuit) {
    for (var i = 0; i < savedCircuits.length; i++) {
        if(savedCircuits[i].fileName == nameCircuit){
            makeShapesFromJSONcircuit(savedCircuits[i]);
            sessionStorage.setItem("fileName",nameCircuit);
            break;
        }
    };
}
function makeShapesFromJSONcircuit (dataCircuit) {
    circuit = dataCircuit.circuit;
    
    for (var i = 0; i < circuit.arduinos.length; i++) {
        arduino = circuit.arduinos[i].attr;
        if(arduino.typeDisp.indexOf("uno") >= 0)
            makeArduinoUno(arduino.x, arduino.y, arduino.id, arduino.bauds, 
                arduino.conn, arduino.ip, arduino.port, arduino.mac);
        else
            makeArduinoMega(arduino.x, arduino.y, arduino.id, arduino.bauds, 
                arduino.conn, arduino.ip, arduino.port, arduino.mac);
    };
    for (var i = 0; i < circuit.sensors.length; i++) {
        sensor = circuit.sensors[i].attr;
        makeSensor(sensor.width, sensor.height, sensor.x, sensor.y, 
            sensor.typeDisp, sensor.src, sensor.typeConn, sensor.id, 
            sensor.selectedFunction, sensor.humbral);
    };
    for (var i = 0; i < circuit.actuators.length; i++) {
        actuator = circuit.actuators[i].attr;
        makeActuator(actuator.width, actuator.height, actuator.x, actuator.y, 
            actuator.typeDisp, actuator.src, actuator.state, actuator.id);
    };
    for (var i = 0; i < circuit.connections.length; i++) {
        jsonFrom = circuit.connections[i].from;
        jsonTo = circuit.connections[i].to;
        from = null;
        to = null;

        if (jsonFrom.idPin >= 0) {
            if (jsonFrom.typeConn == "Analog") {
                arduino = getShapeById(jsonFrom.idDispositive);
                from = arduino.connAna[jsonFrom.idPin];
            }
            else{
                arduino = getShapeById(jsonFrom.idDispositive);
                from = arduino.connDig[jsonFrom.idPin];
            }
            to = getShapeById(jsonTo.idDispositive).conn;
        }
        else if (jsonTo.idPin >= 0) {
            if (jsonTo.typeConn == "Analog") {
                arduino = getShapeById(jsonTo.idDispositive);
                to = arduino.connAna[jsonTo.idPin];
            }
            else{
                arduino = getShapeById(jsonTo.idDispositive);
                to = arduino.connDig[jsonTo.idPin];
            }
            from = getShapeById(jsonFrom.idDispositive).conn;
        };

        connect(from, to);
    };
}
function getShapeById (idShape) {
    for (var i = 0; i < shapes.length; i++) {
        if(shapes[i].id == idShape)
            return shapes[i];
    };
}


function contextMenu(){
    $(event.srcElement).on('contextmenu', function() {
        event.preventDefault();

        document.getElementById("rmenu").className = "show";  
        document.getElementById("rmenu").style.top =  event.y;
        document.getElementById("rmenu").style.left = event.x;

        window.focusShape = event.srcElement;

        //Evitamos q se pueda hacer zoom en el arduino quitando las opciones
        /*window.opera = true;
        selectElement = paper.getElementByPoint(focusShape.x.animVal.value, focusShape.y.animVal.value);
        if (selectElement.type.indexOf("arduino") >= 0) {
            $("#zoomIn")[0].setAttribute("style","display: none;");
            $("#zoomOut")[0].setAttribute("style","display: none;");
        }*/
        for (var i = 0; i < shapes.length; i++) {
            if(shapes[i].node == window.focusShape){
                if (shapes[i].type.indexOf("arduino") >= 0) {
                    $("#zoomIn")[0].setAttribute("style","display: none;");
                    $("#zoomOut")[0].setAttribute("style","display: none;");
                    break;
                }
                else{
                    $("#zoomIn")[0].setAttribute("style","display: block;");
                    $("#zoomOut")[0].setAttribute("style","display: block;");
                }
            }
        };

        
    });
    $(this).on('click', function() {
        if(document.getElementById("rmenu").className.indexOf("show") >= 0){
            event.preventDefault();
            document.getElementById("rmenu").className = "hide";
            window.focusShape = null;
        }
    });
}

function contextMenuConn(){
    $(event.srcElement).on('contextmenu', function() {
        event.preventDefault();

        document.getElementById("rmenuConn").className = "show";
        document.getElementById("rmenuConn").style.top =  event.y;
        document.getElementById("rmenuConn").style.left = event.x;

        window.focusConn = event.srcElement;
    });
    $(this).on('click', function() {
        if (document.getElementById("rmenuConn").className.indexOf("show") >= 0) {
            event.preventDefault();
            document.getElementById("rmenuConn").className = "hide";
            window.focusConn = null;
        }
    });
}

function deleteShape(){
    for (var i = 0; i < shapes.length; i++) {
        if(shapes[i].node == window.focusShape){
            removeShape(shapes[i]);
            break;
        }
    };
}
function deleteConn(){
    for (var i = 0; i < connections.length; i++) {
        if(connections[i].line.node == window.focusConn || connections[i].bg.node == window.focusConn){
            removeConn(connections[i]);
            connections.splice(i,1);
            break;
        }
    };
}

function zoomIn(){
    for (var i = 0; i < shapes.length; i++) {
        if(shapes[i].node == window.focusShape){
            if (shapes[i].type.indexOf("arduino") >= 0) break;
            shapes[i].attr("width",shapes[i].attr("width")*1.3);
            shapes[i].attr("height",shapes[i].attr("height")*1.3);
            shapes[i+1].attr("cy", shapes[i+1].attr("cy")*1.15 );
            shapes[i+1].attr("cx", shapes[i+1].attr("cx")*1.02 );
            break;
        }
    };
}
function zoomOut(){
    for (var i = 0; i < shapes.length; i++) {
        if(shapes[i].node == window.focusShape){
            if (shapes[i].type.indexOf("arduino") >= 0) break;
            shapes[i].attr("width",shapes[i].attr("width")/1.3);
            shapes[i].attr("height",shapes[i].attr("height")/1.3);
            shapes[i+1].attr("cy", shapes[i+1].attr("cy")/1.15 );
            shapes[i+1].attr("cx", shapes[i+1].attr("cx")/1.02 );
            break;
        }
    };
}

function doubleClick(shape){
    window.focusShape = event.srcElement;
    if(shape.type.toUpperCase().indexOf("ARDUINO") >= 0){
        optionsArduino(shape);
    }
    else if(shape.type.toUpperCase().indexOf("SENSOR") >= 0){
        optionsSensor(shape);
    }
    else if(shape.type.toUpperCase().indexOf("ACTUATOR") >= 0){
        optionsActuator(shape);
    }
}

function saveArduinoOptions(){
    id = $("#idArduino")[0].value;
    bauds = $("#bauds")[0].value;
    conn = $("#tipoConexion")[0].value;
    ip = $("#ip")[0].value;
    port = $("#puerto")[0].value;
    mac = $("#mac")[0].value;

    for (var i = 0; i < shapes.length; i++) {
        if(shapes[i].node == window.focusShape){
            if(id)   shapes[i].id = id;
            if(bauds) shapes[i].bauds = bauds;
            if(conn) shapes[i].conn = conn;
            if(ip) shapes[i].ip = ip;
            if(port) shapes[i].port = port;
            if(mac) shapes[i].mac = mac;

            $("#opcArdu").modal("hide");
            window.focusShape = null;
            break;
        }
    }

    //arduino opt
    $("#tipoConexion")[0].value = "";
    $("#ip")[0].value = "";
    $("#puerto")[0].value = "";
    $("#mac")[0].value = "";
}
function saveSensorOptions(){
    id = $("#idSens")[0].value;
    func = $("#tipoFunc")[0].value;
    hum = $("#numHumbral")[0].value;
    if (func.indexOf('threshold') < 0)
        hum = null;

    if(!isIdUnico(id, window.focusShape)){
        id = null;
        bootbox.alert("<b style='color: red'>Id already exist!</b>");
    }
    if(hum && hum.trim().length == 0)
        bootbox.alert("<b style='color: red'>Threshold invalid!</b>");

    for (var i = 0; i < shapes.length; i++) {
        if(shapes[i].node == window.focusShape){
            /*if(id)   shapes[i].id = id;
            if(func) shapes[i].selectedFunction = func;
            if(hum)  shapes[i].humbral = hum;*/
            shapes[i].id = id;
            shapes[i].selectedFunction = func;
            shapes[i].humbral = hum;

            $("#opcSens").modal("hide");
            window.focusShape = null;
            break;
        }
    }

    $("#tipoFunc")[0].value = "";
    $("#numHumbral")[0].value = "";
}

function saveActuatorOptions () {
    id = $("#idAct")[0].value;
    if(!isIdUnico(id, window.focusShape)){
        id = null;
        bootbox.alert("<b style='color: red'>Id already exist!</b>");
    }

    for (var i = 0; i < shapes.length; i++) {
        if(shapes[i].node == window.focusShape){
            if(id)   shapes[i].id = id;

            $("#opcAct").modal("hide");
            window.focusShape = null;
            break;
        }
    }

}

function validate () {
    nameUser = getNameUser();
    fileName = getNameSavedFile();
    
    if (!nameUser) {
        $("#loginbox").modal("show");
    }
    else if (!fileName) {
        boxSaveAs();
    }
    else{
        silentSave(fileName, nameUser);
        message = valide();
        text = "";
        if (message.length > 0) {
            text = "<b style='color: red'>The model have errors</b>";
            text += "<ul style='color: red'>";
            for (var i = 0; i < message.length; i++) {
                text += "<li>"+message[i]+"</li>";
            };
            text += "</ul>";

            bootbox.alert(text);
        }
        else{
            json = { nameUser : nameUser, fileName : fileName };

            $.post( "http://127.0.0.1:3001/tesina/makeFile", json, "json")
            .done(function(data){
                text = "<h3 style='color: green'>Compiled correctly!</h3>";
                text +="<ul>"+
                    "<li><a target='_blank' href='http://127.0.0.1:3001/files/"+nameUser+"/"+fileName+".zip'>Download code</a></li>"+
                    "<li><a target='_blank' href='http://127.0.0.1:3001/files/"+nameUser+"/"+fileName+".json'>Download JSON</a></li></ul>";
                bootbox.alert(text);
            })
            .fail(function(data){
                text = "<h3 style='color: red'>Error!</h3> "+data.responseText;
                bootbox.alert(text);
                console.error(data.responseText);
            });
        }
    }
}

function valide(){
    $("body")[0].setAttribute("style","cursor: wait;");
    
    message = Array();
    if(shapes.length == 0) //Miramos que haya componentes
        message.push("Components not found!");
    if(countDispo()-1 != connections.length) //Que no haya dispositivos sin conectar
        message.push("Device not connected!");
    wc = wellConnected();
    if (wc.length > 0) // Que esten conectados en sus respectivos conectores
        for (var i = 0; i < wc.length; i++)
            message.push("Device "+wc[i].id
                +" bad connected, should be connected to a "+wc[i].typeConn+" pin.");
    ac = areConfigured();
    if (ac.length > 0)  // Que esten configurados
        for (var i = 0; i < ac.length; i++)
            message.push("Device "+ac[i].id+" not configured!");
    if(allDiferentId().length > 0)
        message.push("Two devices have same Id!");

    $("body")[0].removeAttribute("style");

    return message;
}

function countDispo(){
    contArdu = 0;
    contSens = 0;
    contActu = 0;
    for (var i = 0; i < shapes.length; i++) {
        if(shapes[i].type != null && shapes[i].type.indexOf("arduino") >= 0)
            contArdu++;
        if(shapes[i].type != null && shapes[i].type.indexOf("Sensor") >= 0)
            contSens++;
        if(shapes[i].type != null && shapes[i].type.indexOf("Actuator") >= 0)
            contActu++;
    };
    return contSens + contArdu + contActu;
}

function wellConnected () {
    badConn = Array();
    for (var i = 0; i < connections.length; i++) {
        if(connections[i].from.parent.type.indexOf("Sensor") >= 0){
            type = connections[i].from.typeConn;
            conn = connections[i].to;
            if(type != conn.typeConn) badConn.push(connections[i].from.parent);
        }
        else if(connections[i].to.parent.type.indexOf("Sensor") >= 0){
            type = connections[i].to.parent.typeConn;
            conn = connections[i].from;
            if(type != conn.typeConn) badConn.push(connections[i].to.parent);
        }
    }
    return badConn;
}

function areConfigured () {
    notConf = Array();
    for (var i = 0; i < shapes.length; i++) {
        if(shapes[i].type.indexOf("arduino") >= 0){
            if(!shapes[i].bauds || !shapes[i].conn)
                notConf.push(shapes[i]);
            else if(shapes[i].conn == "Ethernet" && (!shapes[i].ip || !shapes[i].port || !shapes[i].mac))
                notConf.push(shapes[i]);
        }
        else if(shapes[i].type.indexOf("Sensor") >= 0){
            if(!shapes[i].id || !shapes[i].selectedFunction)
                notConf.push(shapes[i]);
            else if(shapes[i].selectedFunction.indexOf("threshold") >= 0 && !shapes[i].humbral)
                notConf.push(shapes[i]);
        }
    };
    return notConf;
}

function allDiferentId () {
    equals = Array();
    for (var i = 0; i < shapes.length; i++) {
        for (var j = 0; j < shapes.length; j++) {
            if(i != j && shapes[i].id == shapes[j].id)
                equals.push(shapes[i]);
        };
    };
    return equals;
}

function isIdUnico (id, self) {
    for (var i = 0; i < shapes.length; i++) {
        if(shapes[i].node != self && shapes[i].id == id)
            return false;
    };
    return true;
}


function showSimulate () {
    name = getNameUser();
    fileName = getNameSavedFile();

    if (!name) // si no esta loguejat
        $("#loginbox").modal("show");
    else{
        if (valide().length != 0) // si no esta valid
            validate();
        else{
            if(!fileName) // si no esta guardat
                boxSaveAs();
            $("#console").toggle( "drop",{direction : "right"} ); // mostramos la consola
        }
    }
}

function simulate () {
    window.simulateOn = !simulateOn;
    if(simulateOn){
        if (valide().length != 0) // si no esta valid
            validate();
        else{
            silentSave(fileName, name);
            $("#startSimulate")[0].textContent = "Stop";
            $("#consoleout").prepend("Simulate On\n");
            startstopSimulate();
            window.intervalID = window.setInterval(getSimulateData, intervalSeconds*100);
            $("#simulator")[0].setAttribute("class","btn btn-default active");
        }
    }
    else{
        $("#startSimulate")[0].textContent = "Start";
        startstopSimulate();
        clearInterval(intervalID);
        $("#simulator")[0].setAttribute("class","btn btn-default"); $("#canvas").focus();
        $("#consoleout").prepend("Simulate Off\n");
    }
}

function startstopSimulate () {
    nameUser = getNameUser();
    fileName = getNameSavedFile();
    $.ajax({
        type: "PUT", //PUT no funciona, el server recive OPTIONS
        url: "http://127.0.0.1:3001/tesina/simulator/start",
        data: { nameUser: nameUser, fileName: fileName, state : simulateOn }
    })
    .fail(function( msg ) {
        $.ajax({
        type: "POST", //PUT no funciona, el server recive OPTIONS
        url: "http://127.0.0.1:3001/tesina/simulator/start",
        data: { nameUser: nameUser, fileName: fileName, state : simulateOn }
        })
        .fail(function( msg ) {
            $("#consoleout").prepend("Error: "+msg.state()+"\n");
            console.error(msg);
        });
    });
}

function getSimulateData() {
    nameUser = getNameUser();
    fileName = getNameSavedFile();

    //recogemos los datos de los componentes
    $.ajax({
        url: "http://127.0.0.1:3001/tesina/simulator/"+nameUser+"/"+fileName,
    })
    .done(function( data ) { showResults(data); })
    .fail(function (err) {$("#consoleout").prepend("Data not found!<br>\n"); simulate();});
}

function showResults (data) {
    text = "";
    for (var i = 0; i < data.length; i++) {
        text += data[i].idSensor;
        text += " : ";
        if (typeof data[i].value == "number" && data[i].value < 1)
            text += data[i].value.toFixed(4);
        else
            text += data[i].value;
        text += "<br>\n";
    };

    $("#consoleout").prepend(text+"<br>\n");
    //$("#consoleout")[0].scrollTop = $("#consoleout")[0].scrollHeight; // Movemos el scroll hacia abajo
}

function clearConsole () {
    $("#consoleout").html("");
}


//******************************
function getNameUser () {
    if(localStorage.length > 0 || sessionStorage.length > 0){
        nameUser = localStorage.alias;
        if(!nameUser) nameUser = sessionStorage.alias;
        return nameUser;
    }
}

function getNameSavedFile () {
    if(sessionStorage.length > 0){
        file = sessionStorage.getItem("fileName");
        return file;
    }
}

//Similar a un sleep
function pausecomp(ms) {
    ms += new Date().getTime();
    while (new Date() < ms){}
} 