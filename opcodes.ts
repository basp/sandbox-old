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
 
function isTinyIntOpCode(op: Op): boolean {
	return false;
}

function tinyIntToOpCode(n: number): Op {
	return 0;
}

function opCodeToTinyInt(op: Op): number {
	return 0;
}

function inTinyIntRange(n: number): boolean {
	return false;
}
 
export {
	Op,
	tinyIntToOpCode,
	opCodeToTinyInt,
	inTinyIntRange,
	isTinyIntOpCode		
}