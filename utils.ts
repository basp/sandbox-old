/// <reference path="typings/tsd.d.ts" />

function readInt32(b: Buffer): number {
    var n = 0;
    if (b.length > 3) {
        n += b.readInt32BE(0);
    } else if (b.length > 1) {
        n += b.readInt16BE(0);
    } else if (b.length > 0) {
        n += b.readInt8(0);
    }
    return n;
}

export { readInt32 }