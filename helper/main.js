const { spawn } = require('child_process');
const { save, input, config } = require('../crawler');

let TOTAL;
let inputArray =[];
let fail=[];
let counter=-1;	


(function init(){
	console.log('fetch requestet sites');
	input().then(urls=>{
		
		inputArray=urls;
		TOTAL=inputArray.length;
		for(let i=0; i<config.TASK; i++){
			console.log('task '+i+' run..');
			task(i);
		}
	})
	.catch(err=>{
		console.log('can not execute input function',err);
	});
	
	
})();

function task(id){
	spawnIt(id)
	.then(memo=>{
		saveIt(memo);
		restart(memo);
	})
	.catch(memo=>{
		fail.push(memo);
		restart(memo); 	//double restart becouse .finally is not supported by nodejs 8
	});
}

function spawnIt(id){
	return new Promise((resolve, reject) => {
		if( inputArray.length<1 )
			resolve();
		
		let memo={
			id:id,
			counter:(inputArray.length-1),
			input:config.PATH+inputArray.pop()
		};
		
		const node = spawn('node',[
			'./helper/child',
			'-url='+memo.input
		])
		
		node.stdout.on('data', data => {
			memo.data=data.toString();//JSON.stringify(data);//(new Buffer(data)).toString();
		});
		
		node.on('close', code => { 
			memo.code=code;
			if(code==0) resolve(memo);
			else if(code==1) reject(memo);	//with restart
			else finish(memo);
		});
		
		node.stderr.on('err', err => {
			memo.err=err;
			reject(memo);
		});
	});
}

function restart(memo){
	if( inputArray.length>0 ){ task(memo.id) }
	else finishTask(memo);
}

let finish=0;
function finishTask(memo){
	console.log('task '+memo.id+(memo.code ? ' with error '+memo.code : '')+' terminated!');
	finish++;
	if(finish>=config.TASK) finishAll();
}

function finishAll(){
	console.log('<========== result ============>');
	console.log('');
	console.log('task=',config.TASK);
	//console.log('params=',PARAMS);
	console.log('total=',TOTAL);
	console.log('fail=',fail.length,fail);
	console.log('');
	console.log('>___________ end ______________<');
}

function saveIt(memo={}){
	if(memo.data)
		save(memo.data,memo.counter,memo.input);
}