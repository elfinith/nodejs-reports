var express = require('express');
var router = express.Router();
var	mysql = require("mysql");
	
router.get('/', function(req, res, next) {

	var connection = mysql.createConnection({
		host     : '192.168.0.245',
		user     : 'root',
		database : 'ocsweb'		
	});	
 	connection.connect(); 
	connection.query('SELECT user as "Пользователь", host as "Хост", modem as "Модем" from ListModems;', function(err, rows, fields) {
		if (err) throw err;			
		res.render('report', { title: 'ЖОПА!', data: rows });  				
    });	
	connection.end();	 

});

module.exports = router;
