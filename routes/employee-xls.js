var express = require('express');
var router = express.Router();
var fb = require("node-firebird");

router.get('/', function(req, res, next) {		
	var options = {};
	options.host = '192.168.0.22';
	options.port = 3050;
	options.database='d:\\ibases\\guard.fdb';
	options.user='SYSDBA';
	options.password='masterkey';

	fb.attach(options, function(err,db) {
		if (err) throw err;  
			db.query('select full_name as "ФИО", tabel as "Табномер", full_dep as "Подразделение", rang as "Должность" from today_in_territory_tabel', 
		function(err,result) { 			
			res.xls('Sotrudniki-na-territorii.xlsx', result);								
			db.detach();    		 
		});
	}); 	   
});

module.exports = router;
