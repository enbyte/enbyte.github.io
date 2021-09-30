load_script('https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js');


var hypixel_api_prefix = 'https://api.hypixel.net/';
var bazaar_postfix = 'skyblock/bazaar';
var b_url = hypixel_api_prefix + bazaar_postfix;
var bazaar_data = undefined;

function load_script(url) {
    var script = document.createElement("script");  // create a script DOM node
    script.src = url;  // set its src to the provided URL

    document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}

String.prototype.ucwords = function() {
  str = this.toLowerCase();
  return str.replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g,
  	function(s){
  	  return s.toUpperCase();
	});
};

function prettify(name) {
  return name.replace('_', ' ').ucwords();
}

function did_work(data, status) {
  if (o.status == 200 && data.success) {
    bazaar_data = data;
    return data;
  } else {
  console.log('Request to API servers failed with code ' + status);
  send_bazaar_request();
  }
}

function add_child_p(object, text) {
  p = document.createElement('p');
  p.innerHTML = text; // ok a little cheap here
  object.appendChild(p);
  return p;
}

function display(data, body_object) {  /* todo */
  console.log('display');
  var products = data.products.keys();
  var d = data.products;
  var k = products;
  for (var i = 0; i < products.length; i++) {
    add_child_p(body_object, prettify(d[k[i]].product_id) + "'s buy price is " + String(d[k[i]].quick_status.sellPrice) + " coins.");
  };
};

function send_bazaar_request() {
  console.log('send bz req');
  $.get(b_url, didWork);
}


