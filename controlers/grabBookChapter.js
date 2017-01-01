"use strict";

let Crawler = require("crawler");
let jsdom = require('jsdom');

let models = require("../models");
let logger = require("../common/logger");

let bookModle = models.Book;
let bookDirectoryModle = models.BookDirectory;
let bookChapterModle = models.BookChapter;

let bookName = null;
let bookId = null;
let bookUrl = null;
let ids = [];
let getSingleArticleInterval = null;

let RETRY_TMIE = 0; //重试
let RETRY_TMIE_MAX = 3;
/**
 * 初始化文章列表
 */
function initArgs() {
	ids = [];
	bookDirectoryModle.searchBookDirectory({
		"book_id": bookId
	}, function(bookDirectory) {
		if (!bookDirectory.length) {
			logger.error(`can't find bookDirectory of ${bookName}, please create it!`);
			return false;
		}

		let bookChapters = JSON.parse(bookDirectory[0].book_chapters);
		bookChapters.forEach(function(lis) {
			ids.push(lis.num);
		});

		if (ids.length === 0) {
			return false;
		}
		getArticle();
	});
}

/**
 * 过滤字符串
 */
function filter(txt) {
	if (!txt) {
		return "";
	}
	return txt.replace("\'", "").replace("\"", "").replace("<", "&lt;").replace(">", "&gt;");
}

/**
 * 依次获取文章
 */
function getArticle() {
	let getDir = new Crawler({
		jQuery: jsdom,
		maxConnections: 300,
		forceUTF8: true
	});
	let id = ids.pop();
	RETRY_TMIE = 0;
	getSingleArticle(getDir, id, function() {
		getArticle();
	});
}

/**
 * 获取单篇文章
 */
function getSingleArticle(getDir, id, callback) {
	console.log(`start to grab book chapter${id}`);
	getDir.queue({
		uri: `${bookUrl}/${id}.html`,
		callback: function(error, result, $) {
			crawlerCallback(error, result, $, getDir, id, callback);
		}
	});
}

/*
 * crawler 回调
 */
function crawlerCallback(error, result, $, getDir, id, callback) {
	if (RETRY_TMIE < RETRY_TMIE_MAX && !$ || !result || error) {
		RETRY_TMIE++;
		getSingleArticle(getDir, id, callback);
		logger.error(`id:${id} error and then retry"${error}`);
		return false;
	}
	callback();
	let title = filter($("#amain h1").html()) || "";
	let content = filter($('#contents').html()) || "";
	let contentNavLink = $("#footlink a");

	let pre = "",
		next = "";
	if (contentNavLink && contentNavLink.eq(0) && contentNavLink.eq(0).attr("href")) {
		pre = contentNavLink.eq(0).attr("href").replace(/.*\//ig, "") || "";
	}
	if (contentNavLink && contentNavLink.eq(1) && contentNavLink.eq(1).attr("href")) {
		next = contentNavLink.eq(2).attr("href").replace(/.*\//ig, "") || "";
	}
	let preId = "",
		nextId = "";

	if (/\.html/.test(pre)) {
		preId = pre.replace(/\.html/ig, "");
	}

	if (/\.html/.test(next)) {
		nextId = next.replace(/\.html/ig, "");
	}

	let preTitle = "";
	let nextTitle = "";
	let data = {
		"num": id,
		"title": title,
		"content": content,
		"pre": JSON.stringify({
			id: preId,
			title: preTitle
		}),
		"next": JSON.stringify({
			id: nextId,
			title: nextTitle
		})

	};
	saveBookChapter(data);
}

class BookChapter {
	constructor(obj) {
		this.book_chapter_number = obj.num;
		this.book_chapter_name = obj.title;
		this.book_chapter_content = obj.content;
		this.book_chapter_previous = obj.pre;
		this.book_chapter_next = obj.next;
		this.book_id = bookId;
		this.book_name = bookName;
	}
}

function saveBookChapter(obj) {
	(function(obj) {
		let bookChapter = new BookChapter(obj);
		if (!bookChapter.book_chapter_number) {
			return false;
		}
		bookChapterModle.searchBookChapter({
			"book_id": bookChapter.book_id,
			"book_chapter_number": bookChapter.book_chapter_number
		}, function(oldBookChapter) {
			if (!oldBookChapter.length) {
				bookChapterModle.createBookChapter(bookChapter, function() {
					logger.info(`create ${bookChapter.book_chapter_number} chapter ok!`);
				});
			} else {
				bookChapterModle.updateBookChapter(bookChapter, function() {
					logger.info(`update ${bookChapter.book_chapter_number} chapter ok!`);
				});
			}
		});
	})(obj);
};

module.exports = function(name) {
	bookName = name;
	bookModle.searchBook({
		"book_name": name
	}, function(book) {
		if (book.length) {
			bookUrl = book[0].book_source;
			bookId = book[0].id;
			initArgs();
			logger.info(`start to create the chapters of the book ${name}`);
		} else {
			logger.info(`the book ${name} is not exsit! you can try create it`);
		}
	});

}