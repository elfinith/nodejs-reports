var express = require('express');
var router = express.Router();
var fb = require("node-firebird");
	
router.get('/', function(req, res, next) {		
  var options = {};
  options.host = '192.168.0.28';
  options.port = 3050;
  options.database='d:\\ibases\\tetradka\\dbase.fdb';
  options.user='SYSDBA';
  options.password='masterkey';

  var today = new Date();
  today.setMonth(today.getMonth() - 1);
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear(); 
  if (mm < 10) {
    mm = '0' + mm
  }   
  else {
	mm = mm.toString();
  }
  var month_year = "'" + mm + "." + yyyy + "'";
  fb.attach(options, function(err,db) {
     if (err) throw err;  
     db.query('select traffic as "Трафик", name as "ФИО", ad_login as "Логин", department as "Подразделение" from history_http_month '
		+ 'where month_year = ' + month_year + ' order by traffic descending', 
		function(err,result) { 			
			res.render('report', { title: 'HTTP-трафик за предыдущий месяц', data: result });  						
			db.detach();    		 
     });
  }); 	   		
});

module.exports = router;
