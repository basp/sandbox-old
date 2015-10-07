const enum Op {
	IMM,
	IF,
	EQ, 
	NEQ,
	MAKE_EMPTY_LIST,
	MAKE_SINGLETON_LIST,
	LIST_APPEND,
	LIST_CONCAT,
	JUMP,
	CALL_BI,
	CALL_VERB,
	FORK,
	FORK_ID,
	RETURN,
	RETURN0,
	EXTENDED,
	TINY_INT_START,
	LAST_OP_CODE = 255
}

const TINY_INT_LOW = -10;
const TINY_INT_HI = Op.LAST_OP_CODE - Op.TINY_INT_START + TINY_INT_LOW;

/*
function isOptimNumOpCode(o: OpCode): boolean {
	return o >= OpCode.OptimNumStart;
}

function opCodeToOptimNum(o: OpCode): number {
	return o - OpCode.OptimNumStart + OptimNumLow;
}

function optimNumToOpCode(i: number): OpCode {
	return OpCode.OptimNumStart + i - OptimNumLow;
}

function inOptimNumRange(i: number): boolean {
	return i >= OptimNumLow && i <= OptimNumHi;
}
*/
 
function isTinyIntOpCode(o: Op): boolean {
	return o >= Op.TINY_INT_START;
}

function opCodeToTinyInt(o: Op): number {
	return o - Op.TINY_INT_START + TINY_INT_LOW;
}

function tinyIntToOpCode(i: number): Op {
	return Op.TINY_INT_START + i - TINY_INT_LOW;
}

function inTinyIntRange(i: number): boolean {
	return i >= TINY_INT_LOW && i <= TINY_INT_HI;
}
 
export {
	Op,
	tinyIntToOpCode,
	opCodeToTinyInt,
	inTinyIntRange,
	isTinyIntOpCode		
}