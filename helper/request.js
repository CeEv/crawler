const request = require('request-promise-native');

module.exports = function requestData(url,timeout){
	if(url==undefined){
		process.exit(0)
	}
	
	const options={
		uri: url,
		method: 'GET',
		headers:{
			//"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			//"Accept-Encoding":"gzip, deflate, br"
		},
		json: true,
		timeout: timeout||60000
	}
	//header: { "content-type": "application/json" }
	
	return request(options);
}