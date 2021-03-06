"use strict";
let fs = require("fs");
let path = require("path");
let express = require('express');
let router = express.Router();
let directory = null;

let getBook = require("../controlers").getBook;
let getBookDirectory = require("../controlers").getBookDirectory;
let getBookChapter = require("../controlers").getBookChapter;

let checkParam = require('../common/checkParam');

// 获取文章列表
router.get("/book", function(req, res, next) {
	getBook(function(directoryData) {
		let arr = [];
		if (directoryData && typeof directoryData === "object") {
			directoryData.forEach(function(tag, i) {
				let obj = {};
				obj.id = tag.id;
				obj.title = tag.book_name;
				obj.author = tag.book_author;
				arr.push(obj);
			});
		}
		res.json({
			"status": 1,
			"data": arr,
			serverTime: Date.now()
		});
	});
});

// 获取文章章节列表
router.get("/book/:id", function(req, res, next) {
	if (!checkParam.checkNumParam(req,'test')) {
		next();
	}
	let id = req.params.id;
	getBookDirectory(id, function(directoryData) {
		var arr = [];
		if (directoryData && typeof directoryData === "object") {
			arr = JSON.parse(directoryData.book_chapters);
		}
		res.json({
			"status": 1,
			"data": {
				chapters:arr,
				bookName: directoryData.book_name
			},
			serverTime: Date.now()
		});
	});
});

// 获取文章章节信息
router.get("/book/:id/:num", function(req, res, next) {
	if (!checkParam.checkNumParam(req)) {
		next();
	}
	let id = req.params.id;
	let num = req.params.num;
	let content = null,
		title = null;
	getBookChapter(id, num, function(contentData) {
		let title = contentData.book_chapter_name || "";
		let content = contentData.book_chapter_content || "";
		let pre = contentData.book_chapter_previous ? JSON.parse(contentData.book_chapter_previous) : "";
		let next = contentData.book_chapter_next ? JSON.parse(contentData.book_chapter_next) : "";
		res.json({
			"status": 1,
			"data": {
				bookName: contentData.book_name,
				title: title,
				content: content,
				pre: pre,
				next: next,
			},
			serverTime: Date.now()
		});
	});
});

module.exports = function() {
	return router;
};