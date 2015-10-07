/// <reference path="../typings/tsd.d.ts" />

import {exec, Program, Frame} from '../vm';
import {Op, tinyIntToOpCode} from '../opcodes';

function newProgram(main: Buffer, forks?: Buffer[], literals?: any[]): Program {
	return {
		main: main,
		forks: forks || [],
		literals: literals || []
	};
}

describe('vm', () => {
	it('can execute the most basic program', () => {
		var m = new Buffer([Op.RETURN0]);
		var p = newProgram(m);
		var f = new Frame(p);

		var [r, cont, delayed] = exec(f);
		
		expect(r).toBe(0);
		expect(f.stack.length).toBe(0);
		expect(cont).toBeNull();
		expect(delayed).toEqual([]);
	});
	
	it('can return with a value from the stack', () => {
		const v = 'foobar';
		var m = new Buffer([Op.RETURN]);
		var p = newProgram(m);
		var f = new Frame(p);
		f.stack = [v];
		
		var [r, cont, delayed] = exec(f);
		
		expect(r).toBe(v);
		expect(f.stack.length).toBe(0);
		expect(cont).toBeNull();
		expect(delayed).toEqual([]);
	});
	
	it('can load a literal value', () => {
		const v = 'foobar';
		var m = new Buffer([ 
			Op.IMM, 0, 
			Op.RETURN0				// don't pop 
		]);
		
		var p = newProgram(m, [], [v]);
		var f = new Frame(p);
		
		var [r, cont, delayed] = exec(f);
		
		expect(r).toBe(0);
		expect(f.stack.length).toBe(1);
		expect(f.stack[0]).toBe(v);
		expect(delayed).toEqual([]);
	});
	
	it('can suspend a frame', () => {
		const v = 5;
		
		var main = new Buffer([
			Op.IMM, 0, 				// suspend
			tinyIntToOpCode(v),		// 5 seconds
			Op.CALL_BI,				// suspend(5)
			Op.RETURN0				// don't pop
		]);
		
		var p = newProgram(main, [], ['suspend']);
		var f = new Frame(p);
		
		var [r, cont, delayed] = exec(f);
		
		expect(r).toBe(0);
		expect(cont).toBeNull();
		expect(delayed.length).toBe(1);
		expect(delayed[0].frame).toBe(f);
		expect(delayed[0].delay).toBe(v);
	});
	
	it('can fork frames', () => {
		var main = new Buffer([
			tinyIntToOpCode(0),		// fork 0
			tinyIntToOpCode(5),		// delay 5 seconds
			Op.FORK,
			tinyIntToOpCode(1),		// fork 1
			tinyIntToOpCode(6),		// delay 6 seconds
			Op.FORK,
			Op.RETURN0
		]);
		
		var forks = [
			new Buffer([Op.RETURN0]),
			new Buffer([Op.RETURN0])	
		];
		
		var p = newProgram(main, forks);
		var f = new Frame(p);
		
		var [r, cont, delayed] = exec(f);
		
		expect(r).toBe(0);
		expect(cont).toBeNull();
		expect(delayed.length).toBe(2);
		expect(delayed[0].delay).toBe(5);
		expect(delayed[1].delay).toBe(6);
	});
});