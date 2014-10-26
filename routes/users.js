
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/tesina');

var UserSchema = new mongoose.Schema({
	name : String,
	pass : String,
	email : String	
});

Users = mongoose.model('Users', UserSchema);


exports.create = function(request, response){
	response.header("Access-Control-Allow-Origin", "*");
	params = request.body;

	user = new Users({
		name: params.name,
		pass: params.pass,
		email: params.email
	});

	//busca usuaris en eixe nom, pero no torna ni el __v ni el pass
	Users.find({name: params.name},{__v: 0, pass: 0})
	.exec(function(err, data){
		if(data.length > 0 ){
			response.send(409, "User exist!"); // 409 conflict
			console.log(">> Usuario "+params.name+" intento resgistrarse, pero ya esxiste.");
		}
		else{
			user.save(function(err, data){
				if(err){ response.json(420, err); console.log(">> Error al crear el usuario "+name+" /n"+err);}
				else{ response.send(200); console.log(">> User "+params.name+" created!"); }
			})
		}
	});
}

exports.login = function(request, response){
	response.header("Access-Control-Allow-Origin", "*");

	params = request.body;
	Users.find({name: params.name, pass: params.pass},{_id: 0, __v: 0, pass: 0})
	.exec(function(err, data){
		if(err){ 
			console.error(data);
			console.error(err);
			response.send(500, err);
		}
		if(data.length == 1){
			response.send(data);
			console.log(">> Usuario "+params.name+" entró");
		}else{
			console.log(">> Usuario "+params.name+" no encontrado");
			response.send(404,"Usuario/Contraseña no valido ");
		}
	});
}

exports.view = function(request, response){
	Users.find({},{_id: 0, pass: 0})
	.exec(function(err, data){
		if(err) console.error("Error al recuperar los usuarios para visualizarlos \n"+err);
		else response.render('users',{users : data});
	});
}

exports.clean = function(request, response){
	Users.remove({})
	.exec(function(err, data){
		if(err) console.error("Error al eliminar los usuarios");
		response.redirect('/viewusers');
	});
}
