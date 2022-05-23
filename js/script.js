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

async function send_insult(thisForm) {
	show_notification('Sending insult...');
	const hookUrl = 'https://hooks.zapier.com/hooks/catch/2338087/bfsivv6/';
	const formData = new FormData(thisForm);
	const data = Object.fromEntries(formData);
	let response = await fetch(hookUrl, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    let result = await response.json();
	if (result?.status == 'success') {
		show_notification('Yay, all sent. Consider your victim insulted.');
	} else {
		show_notification('Sorry, the interwebs are being a complete tard at the moment, so we were unable to send your insult');
	}
}

function show_notification(message_text) {
	var popup = document.getElementById('insult-popup');
	var the_template_code = document.getElementById('notification-template').innerHTML;
	var the_template = Handlebars.compile(the_template_code);
	popup.innerHTML = the_template(JSON.parse('{"notification_text":"'+message_text+'"}'));
}

window.onload = render_page;
