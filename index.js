var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}

handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/report"] = requestHandlers.report;
handle["/http-last-month"] = requestHandlers.http_last_month;

server.start(router.route, handle);