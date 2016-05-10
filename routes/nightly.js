var express = require('express');
var router = express.Router();
var fb = require("node-firebird");
var	mysql = require("mysql");

router.get('/', function(req, res, next) {

	var dataset = [];	

	getStationsList();

	function getStationsList() {
		var options = {
			host : '192.168.0.28',
			port : 3050,
			database : 'd:\\ibases\\tetradka\\dbase.fdb',
			user : 'SYSDBA',
			password : 'masterkey'
		};
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
		db.detach();
	}

	function onStationsListReady(err, result) {		
		dataset = result.slice(0);
		//dataset.forEach(getADLogin);
		getADLogins();
	}
	
	function getADLogins () {
		var connection = mysql.createConnection({ host : '192.168.0.245', user : 'root', database : 'ocsweb' });	
		connection.connect();
		getADLoginsSQL = 'select distinct userid, name from hardware where name in (\'';
		dataset.forEach(function (item, i, arr) {
			if (i < arr.length - 1) {
				getADLoginsSQL += item["Станция"] + '\',\'';			
			}	
			else {
				getADLoginsSQL += item["Станция"];			
			}					
		});
		getADLoginsSQL +=  '\') order by lastdate desc;';						
		connection.query(getADLoginsSQL, onADLoginsReady);
		connection.end();		
	}
	
	function onADLoginsReady(err, rows, fields) {
		if (err) throw err;
		dataset.forEach(function(item, i, arr) {
			for (var j = 0; j < rows.length; j++) {
				if (item["Станция"] === rows[j].name) {
					item["Логин"] = rows[j].userid;
				}
			}			
		});		
		getEmployeeData();
	}

	function getEmployeeData() {
		var options = {
			host : '192.168.0.28',
			port : 3050,
			database : 'd:\\ibases\\tetradka\\dbase.fdb',
			user : 'SYSDBA',
			password : 'masterkey'
		};
		fb.attach(options, onEmployeeDBConnect);					
	}
	
	function onEmployeeDBConnect(err,db) {	
		if (err) throw err;	
		getEmployeeDataSQL = 'select zup_cache.name, zup_cache.department, ad_accounts.ad_login from zup_cache, ad_accounts '
			+ 'where (zup_cache.zup_id = ad_accounts.zup_id) and (ad_accounts.ad_login in (\'';
		dataset.forEach(function (item, i, arr) {
			if (i < arr.length - 1) {
				getEmployeeDataSQL += item["Логин"] + '\',\'';			
			}	
			else {
				getEmployeeDataSQL += item["Логин"];			
			}					
		});		
		getEmployeeDataSQL += '\'));';
		db.query(getEmployeeDataSQL, onEmployeeDataReady);
		db.detach();
	}
	
	function onEmployeeDataReady(err, result) {
		dataset.forEach(function(item, i, arr) {
			for (var j = 0; j < result.length; j++) {
				if (item["Логин"] === result[j].AD_LOGIN) {
					item["ФИО"] = result[j].NAME;
					item["Подразделение"] = result[j].DEPARTMENT;					
				}
			}			
		});						
		generateReport();
	}
	
	function generateReport() {
		res.render('report', { title: 'Ночные за последнюю неделю', data: dataset });	
	}
			

});

module.exports = router;