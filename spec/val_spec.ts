/// <reference path="../typings/tsd.d.ts" />

import {Val, Type, Err} from '../val';

describe('Values', () => {
    it('can be made from a number', () => {
        var v = Val.num(-123);
        
        expect(v.type).toBe(Type.NUM);
        expect(v.v).toBe(-123);
    });
    
    it('can be made from a string', () => {
        var v = Val.str('foobar');
      
        expect(v.type).toBe(Type.STR);
        expect(v.v).toBe('foobar');  
    })
    
    it('can be made an object id wrapping an int', () => {
        var v = Val.obj(123);
        
        expect(v.type).toBe(Type.OBJ);
        expect(v.v).toBe(123);
    });
    
    it('can be made from an array of other `Val`s', () => {
        const a = [Val.str('foo'), Val.num(-123), Val.obj(123)];
        var v = Val.list(a);
        
        expect(v.type).toBe(Type.LIST);
        expect(v.v).toEqual(a);
    });
    
    it('can be made with errors', () => {
        var v = Val.err(Err.TYPE);
       
        expect(v.type).toBe(Type.ERR);
        expect(v.v).toEqual(Err.TYPE);         
    });
});