const request = require('request-promise-native');
const params = require('./params');
const { parse, config } = require('../crawler');

/***
*	process.exit(0) -> process is closed and task take next dataset
*	process.exit(1) -> process is closed with error and task take next dataset
*	process.exit([>1]) -> process and task is closed
***/
(function init(){
	requestData( params )
	.then(data=>{	
		return parse(data)
	})
	.then(data=>{
		console.log(data); //Pass data to stdout, that main can fetch it.
		process.exit(0);
	}).catch(err=>{
		console.error(err); //?? testen
		process.exit(1);	//exit with error
	}); 
})();

function requestData(params){
	if(params.url==undefined){
		process.exit(0)
	}
	
	const options={
		uri: params.url,
		method: 'GET',
		headers:{
		//	"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
		//	"Accept-Encoding":"gzip, deflate, br"
		},
		json: true,
		timeout: config.REQUEST_TIMEOUT || 60000
	}
	//header: { "content-type": "application/json" }
	
	return request(options);
}
