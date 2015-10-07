/// <reference path="typings/tsd.d.ts" />

import {Op,	isTinyIntOpCode, opCodeToTinyInt} from './opcodes';
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
}

interface DelayedFrame {
	frame: Frame;
	delay: number;
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

class VM {
	exec(f: Frame): [any, DelayedFrame[]] {
		return [0, []];	
	}
		
	private execOne(f: Frame): [any, Frame, DelayedFrame[]] {
		return [0, null, []];
	}
}

function readInt8(f: Frame): number {
	return 0;
}

var bi = {
	suspend: suspend
}

function exec(f: Frame): [any, Frame, DelayedFrame[]] {
	var code = f.vector == -1 ? f.program.main : f.program.forks[f.vector];
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

export {
	Frame,
	Program, 
	exec 
}