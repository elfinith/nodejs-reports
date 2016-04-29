var express = require('express');
var router = express.Router();
var fb = require("node-firebird");
var	mysql = require("mysql");

router.get('/', function(req, res, next) {

	var dataset = [];	
	
	getStationsList();
		
	function getStationsList() {
		var options = {};
		options.host = '192.168.0.28';
		options.port = 3050;
		options.database='d:\\ibases\\tetradka\\dbase.fdb';
		options.user='SYSDBA';
		options.password='masterkey';
		
		fb.attach(options, onDBConnect);				
	}
	
	function onDBConnect(err,db) {
		if (err) throw err;
		var today = new Date();
		var weekago = new Date(); 
		weekago.setDate(today.getDate() - 7);
		getStationsListSQL = 'select count(os_id) as "Количество", hostname as "Станция" from online_stations where monitoring_time between \''
			+ weekago.getFullYear().toString() + '-' + (weekago.getMonth() + 1).toString() + '-' + weekago.getDate().toString() + '\' and \'' 
			+ today.getFullYear().toString() + '-' + (today.getMonth() + 1).toString() + '-' + today.getDate().toString() + '\' '
			+ 'group by hostname order by count(os_id) descending'; 
		db.query(getStationsListSQL, onStationsListReady);

		function onStationsListReady(err, result) {		
			dataset = result.slice(0);
			dataset.forEach(getADLogin);
			
			//getADLogins();	 			     		
			db.detach();	  
		}
		
		function getADLogin(item, i, arr) {
			var connection = mysql.createConnection({ host : '192.168.0.245', user : 'root', database : 'ocsweb' });	
			connection.connect();
			getADLoginSQL = 'select userid from hardware where name=\'' + item["Станция"] + '\' order by lastdate desc;';
			connection.query(getADLoginSQL, onADLoginReady);
			connection.end();
				
			function checkDatasetReady() {
				// рендер только после извлечения последнего элемента! 
				if (i === arr.length - 1) renderReport(); 											
			}
			
			function onADLoginReady(err, rows, fields) {
				if (err) throw err;
				// проверка результата запроса на то, что он вообще есть (не undefined)
				if(!!rows[0]) item["Логин"] = rows[0].userid.toString()																							
				else item["Логин"] = '';																	
				checkDatasetReady();
			}		   			   
		}								
	}		
	
	function renderReport() {
		res.render('report', { title: 'Ночные за последнюю неделю', data: dataset });
	}		
	
});

module.exports = router;