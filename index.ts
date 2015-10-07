/// <reference path="typings/tsd.d.ts" />

import {exec, Frame} from './vm';
import {Op} from './opcodes';

var p = {
	main: new Buffer([
		Op.RETURN0
	]),
	forks: [],
	literals: [
		'foobar'
	]
};

var f = new Frame(p);
var r = exec(f);
console.log(r);
