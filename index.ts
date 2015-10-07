/// <reference path="typings/tsd.d.ts" />

import {exec, Frame} from './vm';
import {Op} from './opcodes';

var p = {
	main: new Buffer([
        Op.IMM, 0,
        Op.IMM, 1,
        Op.CALL_BI,
        Op.POP,
        Op.IMM, 0,
        Op.IMM, 1,
        Op.CALL_BI,
		Op.RETURN
	]),
	forks: [],
	literals: [
                'log',
                ['foo', 'bar', 'quux']
	]
};

var f = new Frame(p);
var [r, cont, delayed] = exec(f);
console.log(r);
