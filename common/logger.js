"use strict";
let log4js = require('log4js');
let path = require('path');
let config = require('../config');
let env = process.env.NODE_ENV || "development";
let logger = log4js.getLogger('book');

log4js.configure({
	appenders: [
	{
		type: 'console'
	},
	{
		type: 'file',
		filename: path.join(__dirname,'../logs/book.log'),
		category: 'book'
	}
	]
});

logger.setLevel("INFO")

module.exports = logger;