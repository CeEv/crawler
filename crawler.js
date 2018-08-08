request = require('./helper/request')

/********************************** main ***************************************/
/* @main */
//input function 
//must return a Promise with chaining array of urls
function input(){
	return request('https://www.deutsche-digitale-bibliothek.de/sitemaps/index.xml')
	.then(xml=>{
		return extractElements(xml,'sitemap',['lastmod','loc']); 
	}).then(list=>{
		//filter by lastmod -> @todo:later
		return list
	}).then(list=>{
		return objArrayToArray(list,'loc');
	});						
}

/* @child */
//must return the parsing result 
//do not use console.log inside this function, it is use to pass data between main and child process
function parse(siteData){
	//let utf8=siteData.toString('utf8');
	//reduce so fast as possible the data overhead in child process	
	siteData = siteData.replace(new RegExp("https://www.deutsche-digitale-bibliothek.de/item/", 'g'),''); //urls not need
	return reduceToRelated(siteData,'loc');//xml tags not need
}

/* @main */
//logic to save the data 
 function save(data,counter,url){
	console.log('Infos:',counter,url);
	stringToArray(data);
	//to do
}

/********************************** helper ***************************************/

function stringToArray(string){
	console.log('string',string,string.length);
	string=string.replace(/\n|\s|\'|\[|\]/g,'');
	let array = string.split(new RegExp(',', 'g'));
	console.log(array.length);
}

function objArrayToArray(array,key){
	return array.map(item=>{
		return item[key];
	});
}

function reduceToRelated(xml,element){
	let array=xml.split(new RegExp('</'+element+'>', 'g'));
	return array.map( item => {
		item=item.split('<'+element+'>')[1];
		return item ? item : '';
	});
}

function splitAll(xml,element){
	return xml.replace(new RegExp('<'+element+'>', 'g'),'').split('</'+element+'>')
}

function splitOne(xml,element){
	return xml.split('</'+element+'>')[0].split('<'+element+'>')[1]
}

function convertXmlToJson(xml,filters){	
	return filters.reduce((json,filter)=>{	
		json[filter]=splitOne(xml,filter);
		return json
	},{});
}

function extractElements(xml,element,filters){
	let array=splitAll(xml,element);
	array.shift();	//remove first
	array.pop(); //remove last
	return array.map(item=>{
		return filters!=undefined ? convertXmlToJson(item,filters) : item ;
	});
}

/******************************* export & config ********************************************/

module.exports={
	input:input,
	save:save,
	parse:parse,
	config:{			//todo:later @override via npm run parameters in child 
		REQUEST_TIMEOUT:30000, //ms
		TASK:8,
		PATH:'' //'https://deutsche-digitale-bibliothek.de'
	}
}