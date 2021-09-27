import 'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js';


var hypixel_api_prefix = 'https://api.hypixel.net/';
var bazaar_postfix = 'skyblock/bazaar';
var b_url = hypixel_api_prefix + bazaar_postfix;

function didWork(data, status) {
  if (o.status == 200 && data.success) {
    display(data);
    return;
  } else {
  console.log('Request to API servers failed with code ' + status);
  send_bazaar_request();
  }
}

function display(data, body_object) {  /* todo */  };

function send_bazaar_request() {
  $.get(b_url, didWork);
}


