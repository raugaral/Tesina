$(function() {
	if(localStorage.length > 0){
		$("#topLeft").html("<p>Hi <b> "+localStorage.alias+" </b> | <a href='#' onclick='localStorage.clear();location.reload();'> Logout </a></p>");
		sessionStorage.removeItem("fileName");
	}
	else if(sessionStorage.length > 0){
		$("#topLeft").html("<p>Hi <b> "+sessionStorage.alias+" </b> | <a href='#' onclick='sessionStorage.clear();location.reload();'> Logout </a></p>");
		sessionStorage.removeItem("fileName");
	}
	addFuntionToSimulateSeconds();
})

function boxSave () {
	if(localStorage.length > 0 || sessionStorage.length > 0){
		file = sessionStorage.getItem("fileName");
		nameUser = localStorage.alias;
		if(!nameUser) nameUser = sessionStorage.alias;
		if(file)
			save(file, nameUser);
		else
			boxSaveAs();
	}
	else
		$("#loginbox").modal("show");
}

function boxSaveAs(){
	if(localStorage.length > 0 || sessionStorage.length > 0)
		bootbox.prompt("Save file name: ", function(result) {
		  if (result && result.trim().length > 0) {
		  	result = result.replace(/ /g,"_");
			nameUser = localStorage.alias;
		  	if(!nameUser) nameUser = sessionStorage.alias;
		    save(result, nameUser);
		  }
		  else if(result != null)
		  	bootbox.alert("<b style='color: red'>Name not valid</b>");
		});
	else
		$("#loginbox").modal("show");
}

function boxLoad(data){
	$('#filesLoad').children().remove();
	for(i = 0; i < data.length; i++){
	    $('#filesLoad').append('<tr onclick=\'clearPaper(); $("#cargar").modal("hide"); import_shapes("'+data[i].fileName+'");\'><td> '+(i+1)+' </td> <td> '+data[i].fileName+' </td> <td> '+data[i].date+' </td></tr>');
	}
	$('#cargar').modal('show');
}

function register(){
	//eliminamos mensages de error
	$('#error').children().remove();
	$('#succes').children().remove();
	$.each(
		$.find('.has-error'), 
		function(index, value){ $(value).removeClass("has-error") }
	);
	
	//Recogemos los datos
	email = $('#email').val();
	name = $('#name').val();
	pass = $('#pass').val();
	reenterpass = $('#reenterpass').val();

	//comprovamos que los datos esten correctos
	if(email.trim().length == 0){
		$('#error').append("<p>El Email is necesary!</p>");
		parent = $('#email').parent().parent()
		parent.attr('class',parent.attr('class')+' has-error');
	}	
	else if(name.trim().length == 0){
		$('#error').append("<p>El Alias is necesary!<p>");
		parent = $('#name').parent().parent()
		parent.attr('class',parent.attr('class')+' has-error');
	}
	else if(pass.trim().length == 0){
		$('#error').append("<p>El Password is necesary!<p>");
		parent = $('#pass').parent().parent()
		parent.attr('class',parent.attr('class')+' has-error');
	}
	else if(reenterpass.trim().length == 0){
		$('#error').append("<p>The Password repeat is necesary!<p>");
		parent = $('#reenterpass').parent().parent()
		parent.attr('class',parent.attr('class')+' has-error');
	}
	else if(!$('#humancheck-1').is(':checked')){
		$('#error').append("<p>Only humans!</p>");
	}
	else{
		//Hacemos la peticion
		json = {"name":name, "pass":pass, "email":email};
		$.post( "http://127.0.0.1:3001/tesina/createuser", json, "json" )
			.done(function (data) {
				$('#succes').html("<p><b>Saved Correctly</b></p>");
			})
			.fail(function(data){
	            $('#error').html("<p><b>Error: "+data.status()+"</b></p>");
	            console.error(data);
	        });
	}
}

function login(){
	nameUser = $('#userid').val();
	pass = $('#passwordinput').val();
	remember = $('#rememberme-0').is(':checked');

	if(nameUser.trim().length == 0 || pass.trim().length == 0)
		$('#errorlogin').html("Enter a User/Password");
	else{
		json = {"name":nameUser, "pass":pass};
		$.post( "http://127.0.0.1:3001/tesina/login", json, 
			function( data ) {
				if(remember){
					localStorage.setItem('alias',data[0].name);
					localStorage.setItem('email',data[0].email);
				}else{
					sessionStorage.setItem('alias',data[0].name);
					sessionStorage.setItem('email',data[0].email);
				}
			  $("#loginbox").modal("hide");
			  $("#topLeft").html("<p>Hi <b>"+data[0].name+"</b> | <a href='#' onclick='localStorage.clear();sessionStorage.clear();location.reload();'>Logout</a></p>");
			}, 
			"json" )
		.fail(function(data){
			$('#errorlogin').html("User/Password no valid");
			console.log(data);
		});
	}
}

function optionsArduino(shape){
	$("#idArduino")[0].value = "";
	$("#tipoConexion")[0].children[0].setAttribute("selected","");
	$('#ethernetOpt')[0].setAttribute('style','display: none');
	$("#ip")[0].value = "";
	$("#puerto")[0].value = "";
	$("#mac")[0].value = "";
	
	if(shape.id) $("#idArduino")[0].value = shape.id;
	options = $("#bauds")[0].children;
	if(!shape.bauds)
		options[4].setAttribute("selected",""); 
	else{
		options[4].removeAttribute("selected"); 
		for(i = 0; i < options.length; i++){
			if(options[i].value == shape.bauds)
				options[i].setAttribute("selected","");
		}
	}
	if(shape.ip) $("#ip")[0].value = shape.ip;
	if(shape.port) $("#puerto")[0].value = shape.port;
	if(shape.mac) $("#mac")[0].value = shape.mac;
	if(shape.conn == "Ethernet"){
		$("#tipoConexion")[0].children[1].setAttribute("selected","");
		$('#ethernetOpt')[0].setAttribute('style','display: block');
	}

	$("#opcArdu").modal("show");
}

function optionsSensor(shape){
	//$("#opcSensTitle").html(shape.type+"'s Options");
	$('#humbral')[0].setAttribute('style','display: none');
	$("#tipoFunc").html("");
	$("#idSens")[0].value = "";
	$("#numHumbral")[0].value = "";

	if(shape.id) $("#idSens")[0].value = shape.id;
	if(shape.humbral) $("#numHumbral")[0].value = shape.humbral;
	for (var i = 0; i < shape.functions.length; i++) {
		if (shape.functions[i] == shape.selectedFunction){
			$("#tipoFunc").append("<option selected>"+shape.functions[i]+"</option>");
			if (shape.functions[i].indexOf("threshold") >= 0) 
				$('#humbral')[0].setAttribute('style','display: block');
		}
		else
			$("#tipoFunc").append("<option>"+shape.functions[i]+"</option>");
	};

	$("#opcSens").modal("show");
}

function optionsActuator (shape) {
	$("#idAct")[0].value = "";
	
	if(shape.id) $("#idAct")[0].value = shape.id;
	
	$("#opcAct").modal("show");
}

function deleteAll(){
	if (shapes.length > 0){
		bootbox.confirm("Are you sure?<br>The not saved data, will be deleted!", function(result) {
		if(result)
	  		clearPaper();
	  		sessionStorage.removeItem("fileName");
		}); 
	}
}


function addFuntionToSimulateSeconds () {
	$('.btn-number').click(function(e){
	    e.preventDefault();
	    
	    fieldName = $(this).attr('data-field');
	    type      = $(this).attr('data-type');
	    var input = $("input[name='"+fieldName+"']");
	    var currentVal = parseFloat(input.val());
	    if (!isNaN(currentVal)) {
	        if(type == 'minus') {	            
	            if(currentVal > input.attr('min')) {
	                input.val(currentVal - 0.5).change();
	                window.intervalSeconds-=5;
	            } 
	            if(parseFloat(input.val()) == input.attr('min')) {
	                $(this).attr('disabled', true);
	            }
	        } else if(type == 'plus') {
	            if(currentVal < input.attr('max')) {
	                input.val(currentVal + 0.5).change();
	                window.intervalSeconds+=5;
	            }
	            if(parseFloat(input.val()) == input.attr('max')) {
	                $(this).attr('disabled', true);
	            }
	        }
	    } else {
	        input.val(0);
	    }
	});
	$('.input-number').focusin(function(){
   		$(this).data('oldValue', $(this).val());
	});
	$('.input-number').change(function() {	    
	    minValue =  parseFloat($(this).attr('min'));
	    maxValue =  parseFloat($(this).attr('max'));
	    valueCurrent = parseFloat($(this).val());
	    
	    name = $(this).attr('name');
	    if(valueCurrent >= minValue) {
	        $(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
	    } else {
	        alert('Sorry, the minimum value was reached');
	        $(this).val($(this).data('oldValue'));
	    }
	    if(valueCurrent <= maxValue) {
	        $(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
	    } else {
	        alert('Sorry, the maximum value was reached');
	        $(this).val($(this).data('oldValue'));
	    }
	});
}
