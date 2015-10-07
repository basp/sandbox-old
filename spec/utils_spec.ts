/// <reference path="../typings/tsd.d.ts" />

import * as utils from '../utils';

describe('readInt32', () => {
	it('reads an int32 from a 1 byte buffer', () => {
		const v = -10;
		
		var b = new Buffer(1);
		b.writeInt8(v, 0);
		
		var i = utils.readInt32(b);
		expect(i).toBe(v);
	});
	
	it('reads an int32 from a 2 byte buffer', () => {
		const v = -4000;
		
		var b = new Buffer(2);
		b.writeInt16BE(v, 0);
		
		var i = utils.readInt32(b);
		expect(i).toBe(v); 
	});
	
	it('reads an int32 from a 4 byte buffer', () => {
		const v = -5 * 1000 * 1000;
		
		var b = new Buffer(4);
		b.writeInt32BE(v, 0);
		
		var i = utils.readInt32(b);
		expect(i).toBe(v);		
	});
});