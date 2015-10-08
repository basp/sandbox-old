/// <reference path="typings/tsd.d.ts" />

import {Op, isTinyIntOpCode, opCodeToTinyInt} from './opcodes';
import {Val, Type, Err} from './val';
import * as utils from './utils';

interface Program {
    main: Buffer;
    forks: Buffer[];
    literals: Val[];
}

class Frame {
    program: Program;
    vector: number;
    prev: Frame;

    ip = 0;
    stack: Val[] = [];
    
    constructor(program: Program, vector = -1, prev: Frame = null) {
        this.program = program;
        this.vector = vector;
        this.prev = prev;
    }
    
    code(): Buffer {
        return this.vector == -1 
            ? this.program.main 
            : this.program.forks[this.vector];
    }
}

interface DelayedFrame {
    frame: Frame;
    delay: number;
}

class Interpreter {
    exec(f: Frame): [Val, DelayedFrame[]] {
        var delayed = [];
        var top = f;
        while (top) {
            let [r, cont, forks] = this.exec1(top);
            delayed = delayed.concat(forks);
            if (cont) {
                top = cont;
                top.stack.push(r);
            } else {
                return [r, delayed];
            }
        }
    }

    exec1(f: Frame): [Val, Frame, DelayedFrame[]] {
        var code = f.code();
        var delayed: DelayedFrame[] = [];
        while (true) {
            let op = code[f.ip];
            switch (op) {
                case Op.IMM:
                    {
                        let slot = readInt32(f);
                        let r = f.program.literals[slot];
                        f.stack.push(r);
                        break;
                    }
                case Op.CALL_BI:
                    {
                        f.ip += 1;
                        let args = f.stack.pop();
                        let fname = f.stack.pop();
                        return this[fname.v](f, args);
                    }
                case Op.FORK:
                    {
                        let delay = f.stack.pop();
                        let index = f.stack.pop();
                        let fork = {
                            frame: new Frame(f.program, index.v),
                            delay: delay.v
                        };
                        delayed.push(fork);
                        break;
                    }
                case Op.RETURN:
                    {
                        let r = f.stack.pop();
                        return [r, f.prev, delayed];
                    }
                case Op.RETURN0:
                    return [Val.num(0), f.prev, delayed];
                case Op.POP:
                    f.stack.pop();
                    break;            
                default:
                    if (isTinyIntOpCode(op)) {
                        let i = opCodeToTinyInt(op);
                        f.stack.push(Val.num(i));
                    }
                    else {
                        throw new Error(`Invalid opcode: ${op}`);
                    }
            }
            
            f.ip += 1; 
        }
    }
    
    log(f: Frame, stuff: Val): [any, Frame, DelayedFrame[]] {
        console.log(stuff);
        return [Val.num(0), f, []];
    }
    
    suspend(f: Frame, delay: Val): [any, Frame, DelayedFrame[]] {
        var delayed = {
            frame: f,
            delay: delay.v
        };

    	return [Val.num(0), null, [delayed]]
    }
    
    task_id(f: Frame): [any, Frame, DelayedFrame[]] {
        var r = Math.floor(Math.random() * 10000);
        return [Val.num(r), f, []];
    }
}

function readInt8(f: Frame): number {
    f.ip += 1;
    var code = f.code();
    var buf = code.slice(f.ip, f.ip + 1);
    return utils.readInt32(buf); 
}

function readInt16(f: Frame): number {
    f.ip += 1;
    var code = f.code();
    var buf = code.slice(f.ip, f.ip + 2);
    f.ip += 1;
    return utils.readInt32(buf);
}

function readInt32(f: Frame): number {
    f.ip += 1;
    var code = f.code();
    var buf = code.slice(f.ip, f.ip + 4);
    f.ip += 3;
    return utils.readInt32(buf);
}

export {
    Interpreter,
    Frame,
    Program
}
