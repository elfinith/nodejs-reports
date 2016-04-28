var express = require('express');
var router = express.Router();
var fb = require("node-firebird");
var	mysql = require("mysql");

router.get('/', function(req, res, next) {

	getStationsList();

	function getStationsList() {
		var options = {};
		options.host = '192.168.0.28';
		options.port = 3050;
		options.database='d:\\ibases\\tetradka\\dbase.fdb';
		options.user='SYSDBA';
		options.password='masterkey';

		var today = new Date();
		var weekago = new Date(); 
		weekago.setDate(today.getDate() - 7);

		fb.attach(options, function(err,db) {

			var dataset = [];

			if (err) throw err;         
			db.query('select count(os_id) as "Количество", hostname as "Станция" '
					+ 'from online_stations where monitoring_time between \''
					+ weekago.getFullYear().toString() + '-' + (weekago.getMonth() + 1).toString() + '-' + weekago.getDate().toString() + '\' and \'' 
					+ today.getFullYear().toString() + '-' + (today.getMonth() + 1).toString() + '-' + today.getDate().toString() + '\' '
					+ 'group by hostname order by count(os_id) descending',
					onStationsListReady);

			function onStationsListReady(err, result) {		
				console.log("RESULT: ");
				console.log(JSON.stringify(result));    		   		
				dataset = result.slice(0);
				getADLogins();	 			     		
				db.detach();	  
			}

			function getADLogins() {
				dataset.forEach(function(item, i, arr) {
					var connection = mysql.createConnection({ host : '192.168.0.245', user : 'root', database : 'ocsweb' });	
					connection.connect();   		 		
					connection.query('select userid from hardware where name=\'' + item["Станция"] + '\' order by lastdate desc;', onADLoginReady);
					connection.end();

					function onADLoginReady(err, rows, fields) {
						if (err) throw err;
						// проверка результата запроса на то, что он вообще есть (не undefined)
						if(!!rows[0]) item["Логин"] = rows[0].userid.toString()   		 		   		 	
						else item["Логин"] = '';
						console.log(JSON.stringify(item));

						// рендер только после извлечения последнего элемента! 
						if (i === arr.length - 1) {
							renderReport(); 
						}    		   		 	

					}
				})			   			   
			}

			function renderReport () {
				res.render('report', { title: 'Ночные за последнюю неделю', data: dataset });
			}
		});	  
	}
});

module.exports = router;

/*
 *
     		for (var i = 0; i < result.length; i++) {
    			var connection = mysql.createConnection({ host : '192.168.0.245', user : 'root', database : 'ocsweb' });	
   		 		connection.connect();
   		 		result[i].login1 = '123123';
   		 		console.log(JSON.stringify(result[i]));   		 		
   		 		connection.query('select userid from hardware where name=\'' + result[i].HOSTNAME + '\' order by lastdate desc;',   		 		   		 				
   		 		function(err1, rows, fields) {
   		 			if (err1) throw err1;
   		 			// проверка результата запроса на то, что он вообще есть (не undefined)
   		 			if(!!rows[0]) {  		 				
   		 				//result[i].login = rows[0].userid.toString;
   		 				resp.push({"Хост" : result[i].HOSTNAME.toString(), "Число" : result[i].COUNT.toString(), "Логин" : rows[0].userid.toString()});
   		 			}
   		 			else resp.push({"Хост" : result[i].HOSTNAME.toString(), "Число" : result[i].COUNT.toString(), "Логин" : ''});
   		 			console.log(JSON.stringify(result[i]));
   		 		});
   		 		connection.end();    			
    		}    		

 *
 *
 * */
