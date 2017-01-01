"use strict";
// 数字参数校验
function checkNumParam(req) {
	let id = req.params.id || "";
	let num = req.params.num || "";
	let reg1 = /^(\d|)*$/;
	let reg2 = /^(\d|)*$/;

	if (reg1.test(id) && reg2.test(num)) {
		return true;
	} else {
		return false;
	}
}

module.exports = {
	checkNumParam: checkNumParam
}