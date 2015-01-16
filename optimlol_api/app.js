var express = require('express');
var moment = require('moment');
var logger = require('./common/logger');
var config = require('./config');

var expressRouter = express.Router();
var SummonerRoutes = require('./routes/summonerRoutes');
var summonerRoutes = new SummonerRoutes(expressRouter);

var crossOriginMiddleware = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
};

var loggerMiddleware = function(req, res, next) {
	logger.info("HTTP: " + req.method + " - " + res.statusCode + " - " + req.url + " - - HTTP/" + req.httpVersion);
	next();
};

var app = express();
app.use(crossOriginMiddleware);
app.use(loggerMiddleware);
app.use(expressRouter);
app.listen(config.optimlol_api.port);