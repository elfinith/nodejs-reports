var fb = require("node-firebird");	
	
String.prototype.format = function()
{
  var args = arguments;

  return this.replace(/{(\d+)}/g, function(match, number)
  {
    return typeof args[number] != 'undefined' ? args[number] :
                                                '{' + number + '}';
  });
};

function ConvertJsonToTable(parsedJson, tableId, tableClassName, linkText)
{
    //Patterns for links and NULL value
    var italic = '<i>{0}</i>';
    var link = linkText ? '<a href="{0}">' + linkText + '</a>' :
                          '<a href="{0}">{0}</a>';

    //Pattern for table                          
    var idMarkup = tableId ? ' id="' + tableId + '"' :
                             '';

    var classMarkup = tableClassName ? ' class="' + tableClassName + '"' :
                                       '';

    var tbl = '<table border="1" cellpadding="1" cellspacing="1"' + idMarkup + classMarkup + '>{0}{1}</table>';

    //Patterns for table content
    var th = '<thead>{0}</thead>';
    var tb = '<tbody>{0}</tbody>';
    var tr = '<tr>{0}</tr>';
    var thRow = '<th align="middle"><font size="2" color=black face="Tahoma">{0}</font></th>';
    var tdRow = '<td><font size="2" color=black face="Tahoma">{0}</font></td>';
    var thCon = '';
    var tbCon = '';
    var trCon = '';

    if (parsedJson)
    {
        var isStringArray = typeof(parsedJson[0]) == 'string';
        var headers;

        // Create table headers from JSON data
        // If JSON data is a simple string array we create a single table header
        if(isStringArray)
            thCon += thRow.format('value');
        else
        {
            // If JSON data is an object array, headers are automatically computed
            if(typeof(parsedJson[0]) == 'object')
            {
                headers = array_keys(parsedJson[0]);
				
				// ѕор€дковый номер в заголовке
				thCon += thRow.format("\u2116");
				
                for (i = 0; i < headers.length; i++)
                    thCon += thRow.format(headers[i]);
            }
        }
        th = th.format(tr.format(thCon));
        
        // Create table rows from Json data
        if(isStringArray)
        {
			
            for (i = 0; i < parsedJson.length; i++)
            {
                tbCon += tdRow.format(parsedJson[i]);
                trCon += tr.format(tbCon);
                tbCon = '';
            }
        }
        else
        {
            if(headers)
            {
                var urlRegExp = new RegExp(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);
                var javascriptRegExp = new RegExp(/(^javascript:[\s\S]*;$)/ig);
                
                for (i = 0; i < parsedJson.length; i++)
                {
					// Порядковый номер в строке
					tbCon += tdRow.format((i + 1).toString());
					
                    for (j = 0; j < headers.length; j++)
                    {
                        var value = parsedJson[i][headers[j]];
                        var isUrl = urlRegExp.test(value) || javascriptRegExp.test(value);

                        if(isUrl)   // If value is URL we auto-create a link
                            tbCon += tdRow.format(link.format(value));
                        else
                        {
                            if(value){
                            	if(typeof(value) == 'object'){
                            		//for supporting nested tables
                            		tbCon += tdRow.format(ConvertJsonToTable(eval(value.data), value.tableId, value.tableClassName, value.linkText));
                            	} else {
                            		tbCon += tdRow.format(value);
                            	}
                                
                            } else {    // If value == null we format it like PhpMyAdmin NULL values
                                tbCon += tdRow.format(italic.format(value).toUpperCase());
                            }
                        }
                    }
                    trCon += tr.format(tbCon);
                    tbCon = '';
                }
            }
        }
        tb = tb.format(trCon);
        tbl = tbl.format(th, tb);

        return tbl;
    }
    return null;
}

function array_keys(input, search_value, argStrict)
{
    var search = typeof search_value !== 'undefined', tmp_arr = [], strict = !!argStrict, include = true, key = '';

    if (input && typeof input === 'object' && input.change_key_case) { // Duck-type check for our own array()-created PHPJS_Array
        return input.keys(search_value, argStrict);
    }
 
    for (key in input)
    {
        if (input.hasOwnProperty(key))
        {
            include = true;
            if (search)
            {
                if (strict && input[key] !== search_value)
                    include = false;
                else if (input[key] != search_value)
                    include = false;
            } 
            if (include)
                tmp_arr[tmp_arr.length] = key;
        }
    }
    return tmp_arr;
}

function start(response) {

  console.log("Request handler 'start' was called.");
  
  var current_date = new Date();      
  
  var months = new Array(
	'\u042F\u043D\u0432\u0430\u0440\u044C', 				// Январь
	'\u0444\u0435\u0432\u0440\u0430\u043B\u044C', 			// Февраль
	'\u041C\u0430\u0440\u0442', 							// Март
	'\u0430\u043F\u0440\u0435\u043B\u044C', 				// Апрель
	'\u043C\u0430\u0439', 									// Май
	'\u0438\u044E\u043D\u044C', 							// Июнь
	'\u0438\u044E\u043B\u044C', 							// Июль
	'\u0430\u0432\u0433\u0443\u0441\u0442', 				// Август
	'\u0441\u0435\u043D\u0442\u00A4\u0431\u0440\u044C', 	// Сентябрь
	'\u043E\u043A\u0442\u00A4\u0431\u0440\u044C', 			// Октябрь
	'\u043D\u043E\u00A4\u0431\u0440\u044C', 				// Ноябрь
	'\u0434\u0435\u043A\u0430\u0431\u0440\u044C');			// Декабрь
	
  var month_value = current_date.getMonth() - 1;
  if (month_value < 0) {
	month_value = 0;
  }
  
  //  Менюшка
  var body = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /></head><body></body></html>';
  body += '<ul id="navi">' 
		+ '<li id="mainpage"><a href="../report"> <font size="4" color=black face="Tahoma">\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438 \u043D\u0430 \u0442\u0435\u0440\u0440\u0438\u0442\u043E\u0440\u0438\u0438 \u043F\u0440\u0435\u0434\u043F\u0440\u0438\u044F\u0442\u0438\u044F</font></a></li>'
		+ '<li><a href="../http-last-month"><font size="4" color=black face="Tahoma">HTTP-\u0422\u0440\u0430\u0444\u0438\u043A \u0437\u0430 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u043C\u0435\u0441\u044F\u0446 (' 
			+ months[month_value] + ')</font></a></li>'
		+ '<li><a href="http://192.168.0.245/stats/data-from-csv.htm"><font size="4" color=black face="Tahoma">\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 WAN- \u0438 Exchange-\u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0439 </font></a></li>'			
		+ '</ul>';
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write(body);
  response.end();
}

function report(response) {
  console.log("Request handler 'report' was called.");
  var options = {};
  options.host = '192.168.0.22';
  options.port = 3050;
  options.database='d:\\ibases\\guard.fdb';
  options.user='SYSDBA';
  options.password='masterkey';

  fb.attach(options, function(err,db) {
     if (err) throw err;  
     db.query('select full_name as "\u0424\u0418\u041E", '
		+ 'full_dep as "\u041F\u043E\u0434\u0440\u0430\u0437\u0434\u0435\u043B\u0435\u043D\u0438\u0435", '
		+ 'rang as "\u0414\u043E\u043B\u0436\u043D\u043E\u0441\u0442\u044C" from today_in_territory', 
		function(err,result) { 			
			response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});		 
			response.write('<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /></head>');		 	 
			response.write(ConvertJsonToTable(result, 'jsonTable', 'gray', 'Download'));
			response.write('</html>');
			response.end();		 
		 db.detach();    		 
     });
  }); 	   
}

function http_last_month(response) {
  console.log("Request handler 'http-last-month' was called.");
  var options = {};
  options.host = '192.168.0.28';
  options.port = 3050;
  options.database='d:\\ibases\\tetradka\\dbase.fdb';
  options.user='SYSDBA';
  options.password='masterkey';
  // извлекаем дату в виде "месяц.год"
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
     db.query('select traffic as "\u0422\u0440\u0430\u0444\u0438\u043A, \u043A\u0431", name as "\u0424\u0418\u041E", '
		+ 'ad_login as "\u041B\u043E\u0433\u0438\u043D", '
		+ 'department as "\u041F\u043E\u0434\u0440\u0430\u0437\u0434\u0435\u043B\u0435\u043D\u0438\u0435" from history_http_month '
		+ 'where month_year = ' + month_year + ' order by traffic descending', 
		function(err,result) { 			
			response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});		 
			response.write('<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /></head>');
			response.write(ConvertJsonToTable(result, 'jsonTable', 'gray', 'Download'));
			response.write('</html>');
			response.end();		 
		 db.detach();    		 
     });
  }); 	   
}

exports.start = start;
exports.report = report;
exports.http_last_month = http_last_month;
