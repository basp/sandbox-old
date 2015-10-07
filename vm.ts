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
	vector = -1;
	ip = 0;
	stack = [];
	
	constructor(program: Program) {
		this.program = program;
	}
}

interface DelayedFrame {
	frame: Frame;
	delay: number;
}

function log(f: Frame, stuff: any) {
	console.log(stuff);
	return [0, f, []];
}

function suspend(f: Frame, delay: number) {
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

function exec(f: Frame): [any, Frame, DelayedFrame[]] {
	var code = f.vector == -1 ? f.program.main : f.program.forks[f.vector];
	var delayed = [];
	while (true) {
		let op = code[f.ip];
		switch (op) {
			case Op.IMM:
				{
					let slot = readInt8(f);
					let r = f.program.literals[slot];
					f.stack.push(r);
				}
				break;
			case Op.CALL_BI:
				break;
			case Op.FORK:
				break;
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