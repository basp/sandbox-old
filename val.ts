const enum Type {
    NUM,
    STR,
    OBJ,
    LIST,
    ERR
}

const enum Err {
    NONE,
    TYPE,
    INVARG,
    INTERNAL
}

interface Val {
    type: Type;
    v: any;
}

module Val {
    export function num(n: number): Val {
        return {
            type: Type.NUM,
            v: n
        };
    }
    
    export function str(s: string): Val {
        return {
            type: Type.STR,
            v: s
        };
    }
    
    export function obj(n: number): Val {
        return {
            type: Type.OBJ,
            v: n
        };
    }
    
    export function list(a: Val[]) {
        return {
            type: Type.LIST,
            v: a
        };
    }
    
    export function err(e: Err) {
        return {
            type: Type.ERR,
            v: e
        };
    } 
}

export {
    Val,
    Type,
    Err
}