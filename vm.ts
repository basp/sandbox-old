/// <reference path="typings/tsd.d.ts" />

import {Op, isTinyIntOpCode, opCodeToTinyInt} from './opcodes';
import * as utils from './utils';

interface Program {
	main: Buffer;
	forks: Buffer[];
	literals: any[];
}

class Frame {
	program: Program;
	prev: Frame;
	vector: number;
	ip = 0;
	stack = [];
	
	constructor(program: Program, vector = -1) {
		this.program = program;
		this.vector = vector;
	}
    
    code(): Buffer {
        let code = this.vector == -1 ? this.program.main : this.program.forks[this.vector];
        return code;    
    }
}

interface DelayedFrame {
	frame: Frame;
	delay: number;
}

class VM {
	exec(f: Frame): [any, DelayedFrame[]] {
		return [0, []];	
	}
		
	private execOne(f: Frame): [any, Frame, DelayedFrame[]] {
		return [0, null, []];
	}
}

var bi = {
    log: log,
    suspend: suspend
}

function exec(f: Frame): [any, Frame, DelayedFrame[]] {
    var code = f.code();
    var delayed: DelayedFrame[] = [];
    while (true) {
        let op = code[f.ip];
        switch (op) {
            case Op.IMM:
                {
                    f.ip += 1;
                    let slot = readInt8(f);
                    let r = f.program.literals[slot];
                    f.stack.push(r);
                    break;
                }
            case Op.CALL_BI:
                {
                    let args = f.stack.pop();
                    let fname = f.stack.pop();
                    return bi[fname](f, args);
                }
            case Op.FORK:
                {
                    let delay = f.stack.pop();
                    let index = f.stack.pop();
                    let fork = {
                        frame: new Frame(f.program, index),
                        delay: delay
                    };
                    delayed.push(fork);
                    break;
                }
            case Op.RETURN:
                {
                    let r = f.stack.pop();
                    return [r, null, delayed];
                }
            case Op.RETURN0:
                return [0, null, delayed];
            case Op.POP:
                f.stack.pop();
                break;            
            default:
                if (isTinyIntOpCode(op)) {
                    f.stack.push(opCodeToTinyInt(op));
                }
                else {
                    throw new Error(`Invalid opcode: ${op}`);
                }
        }
        
        f.ip += 1; 
    }
}

function log(f: Frame, stuff: any): [any, Frame, DelayedFrame[]] {
	console.log(stuff);
	return [0, f, []];
}

function suspend(f: Frame, delay: number): [any, Frame, DelayedFrame[]] {
	var delayed = {
		frame: f,
		delay: delay
	};
    
	return [0, null, [delayed]]
}

function readInt8(f: Frame): number {
    var code = f.code();
    var buf = code.slice(f.ip, f.ip + 1);
    return utils.readInt32(buf); 
}

export {
    Frame,
    Program, 
    exec 
}
