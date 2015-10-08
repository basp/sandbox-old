/// <reference path="typings/tsd.d.ts" />

import {exec, VM, Frame} from './vm';
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
        Op.IMM, 2,
        Op.IMM, 3,
        Op.CALL_BI,
        Op.RETURN
	]),
	forks: [],
	literals: [
        'log',
        ['foo', 'bar', 'quux'],
        'suspend',
        5
	]
};

var vm = new VM();
var f = new Frame(p);
var [r, forks] = vm.exec(f);
console.log(forks);
