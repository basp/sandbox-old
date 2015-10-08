/// <reference path="typings/tsd.d.ts" />

import {Interpreter, Frame} from './interpreter';
import {Val} from './val';
import {Op} from './opcodes';
import {LinkedList, LinkedListNode} from './linked-list';

var p = {
	main: new Buffer([
        Op.IMM, 0, 0, 0, 0,
        Op.IMM, 0, 0, 0, 1,
        Op.CALL_BI,
        Op.POP,
        Op.IMM, 0, 0, 0, 0,
        Op.IMM, 0, 0, 0, 1,
        Op.CALL_BI,
        Op.POP,
        Op.IMM, 0, 0, 0, 0,
        Op.IMM, 0, 0, 0, 2,
        Op.IMM, 0, 0, 0, 3,
        Op.CALL_BI,
        Op.CALL_BI,
        Op.POP,
        Op.IMM, 0, 0, 0, 4,
        Op.IMM, 0, 0, 0, 5,
        Op.CALL_BI,
        Op.RETURN
	]),
	forks: [],
    literals: [
        Val.str('log'),
        Val.list([
            Val.str('foo'), 
            Val.str('bar'), 
            Val.str('quux')
        ]),
        Val.str('task_id'),
        Val.num(0),
        Val.str('suspend'),
        Val.num(5),
    ]
};

var interpreter = new Interpreter();
var f = new Frame(p);
var [r, forks] = interpreter.run(f);
console.log(forks);
