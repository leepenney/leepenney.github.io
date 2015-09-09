function loadJSON(filename, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            try {
                var data = JSON.parse(xhr.responseText);
            } catch(err) {
                if (xhr.responseText.length > 0) {
                    console.log(err.message + ' in ' + xhr.responseText);
                } else {
                    console.log('Nothing returned');
                }
                return;
            }
            callback(data);
        }
    };
    xhr.open('GET', filename, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();
}

function list_all_insults(callback) {
    loadJSON('insults.json', function(insults_json) {
        if (insults_json) {
            var list = document.querySelector('.insults-list');
            var the_template_code = document.getElementById('insult-template').innerHTML;
            var the_template = Handlebars.compile(the_template_code);
            list.innerHTML = the_template(insults_json);
			var list_elems = list.getElementsByTagName('li');
			for (var i=0; i < list_elems.length; i++) {
				list_elems[i].onclick = function() {
					window.location.hash = 'insult/' + this.dataset.index;
				};
			}
			callback();
        }
    });
}

function render_page() {
	list_all_insults(function() {
		if (window.location.hash.indexOf('insult/') != -1) {
			render_popup(window.location.hash);
		}
	});
	window.onhashchange = function() {
		if (window.location.hash.indexOf('insult/') != -1) {
			render_popup(window.location.hash);
		}
	};
}

function render_popup(url) {
	var selected_insult = url.split('/');
	var insult_id = selected_insult[1];
	
	loadJSON('insults.json', function(insults_json) {
        if (insults_json) {
			for (var i=0; i < insults_json.length; i++) {
				if (insults_json[i].id == insult_id) {
					var popup = document.getElementById('insult-popup');
					var the_template_code = document.getElementById('popup-template').innerHTML;
					var the_template = Handlebars.compile(the_template_code);
					popup.innerHTML = the_template(insults_json[i]);
					popup.onclick = function(e) {
						if (popup.style.display == 'block') {
							var clicked = e.target;
							if (clicked.className == 'overlay' || clicked.className == 'close') {
								window.location.hash = '';
								popup.style.display = 'none';
							}
						}
					}
					var inputs = document.querySelectorAll('#send-insult > input');
					for (var i=0; i < inputs.length; i++) {
						if (inputs[i].type != 'hidden') {
							inputs[i].onblur = function() {
								this.className = 'not-valid';
							}
						}
					}
					popup.children[0].children[2].onsubmit = function(e) {
						e.preventDefault();
						send_insult(e.target);
					}
					popup.style.display = 'block';
					break;
				}
			}
        }
    });
}

function send_insult(form) {
	/*var form_fields = form.elements;
    var params = '';
    for (var i=0; i<form_fields.length; i++) {
		if (form_fields[i].type != 'submit') {
			params += '&'+form_fields[i].name+'='+encodeURIComponent(form_fields[i].value);
		}
    }
    params = params.substring(1);*/
    var req = new XMLHttpRequest();
	var form_fields = document.getElementById('send-insult').elements;
    var params = '';
    for (var i=0; i<form_fields.length; i++) {
        params += '&'+form_fields[i].name+'='+encodeURIComponent(form_fields[i].value);
    }
    params = params.substring(1);
	show_notification('Sending insult...');
    req.open('get', 'http://mowp.net/tools/oaf/oaf_send_email.php?'+params, true);
    //req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    req.send(params);
    req.onreadystatechange=function(){
        if (req.readyState == 4 && req.status == 200) {
			if (req.responseText == 'ok') {
				console.log('send succeeded '+req.responseText);
				show_notification('Yay, all sent. Consider your victim insulted.');
			} else {
				console.log('send failed '+req.responseText);
				show_notification('Sorry, the interwebs are being a complete tard at the moment, so we were unable to send your insult');
			}
        }
    }
}

function show_notification(message_text) {
	var popup = document.getElementById('insult-popup');
	var the_template_code = document.getElementById('notification-template').innerHTML;
	var the_template = Handlebars.compile(the_template_code);
	popup.innerHTML = the_template(JSON.parse('{"notification_text":"'+message_text+'"}'));
}

window.onload = render_page;

