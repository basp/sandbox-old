### sandbox
This is just for messing around with experimental stuff.

### ambiance
At this point in time this sandbox is dedicated to messing around with ideas
for progressing the `ambiance-vm` repository.

It's a virtual machine that's heavily inspired by LambdaMOO which is a 
fabulous piece of software. It's really well written but for somebody 
(like me) who is not intimately comfortable with `C` it might take a while to
get it. 

The best way to grok something (for me at least) is to try to rebuild it 
in a foreign environment. Note that this is not a port, it will not even be
remotely compatible with LambdaMOO if it ever gets finished. Although some
ideas and concepts will be inspired by it.

In the end it's just a fun project to (try to) implement. It has a broad scope 
from parsing to networking and even multi-threading if you so desire. Yet it's
not so broad that it's an insurmountable obstacle. It is actually doable and if
you even put some moderate effort in it you end up with a pretty interesting
piece of software that not only teaches a lot about software development in
general but also gives you some insight into how really low level stuff works, 
like virtual machines as well as dealing with more higher level things like 
networking and persistence.

### overview
Currently, a `Program` has a `main` buffer and zero or more `forks`. It also 
contains a `literals` array with values that can be lifted straight from the 
source. As an example, the most basic you can construct looks like this:

    var return0 = {
        main: new Buffer([ Op.RETURN0 ]),
        forks: [],
        literals: []
    };
    
The above program has only one instruction: `RETURN0` which does exactly what
it says. Except of course the number `0` is wrapped in a `Val` instance of type
`NUM`. A `Val` can be of type `NUM`, `STR`, `OBJ`, `LIST` or `ERR`. 

To run the above program we need to do a few things though. First is to wrap it
into a `Frame` so we can execute it with an `Interpreter` instance. The 
interpreters like to deal with frames or some kind of context that can remember
stuff. This is because some executions can be delayed over a long time with
`suspend` and `fork` but we'll get to those later. 

It's easy to create a basic run frame if you just wanna run some program:

    // load the `return0` program from earlier
    var frame = new Frame(return0); 
    
This will create a new `Frame` with the vector (either `main` or one
of the `forks`) pointing to `main`. The stack will be empty and the *instruction
pointer* (`ip`) will be zero. Basically, this a `Frame` that you can execute 
straight away but we'll need an `Interpreter` for that as well:

    var interpreter = new Interpreter(); 

In the future we'll need to inject a lot of services into the interpreter because
it needs to call into a lot of host-related stuff like tasks, IO, OS and such. For
now though it doesn't support all that stuff yet so we can just construct one with
an empty constructor.

Now that we have our `Interpreter` instance we can actually execute the frame we
constructed earlier:

    var [result, delayed] = interpreter.run(frame); 

This is TypeScript by the way. The `run` method returns an array of two elements.
The `result` element will be return value of the execution of type `Val` and the 
`delayed` element will be an array of `DelayedFrame` instances. These are frames
that have to be executed (or resumed) at a later time.

### design choices
Here's some of the design choices and paths where the code strayed from the 
original in some original way.

#### to `Val` or not to `Val`
Introducing the `Val` type was painful but it made the system more 
straightforward. It was nice to just JavaScript's built in stuff for a while but
in the end using *tagged values* is a lot easier to program. In the end this 
is (or should be) hidden from the end user anyway.

#### two stacks
Every VM (virtual machine) uses stacks. Even register based VM's use stacks to
keep track of function calls. But *stack based* virtual machines use another
stack to hold intermediate values (which would otherwise go into registers on
register based virtual machines). 

Ambiance is a stack based virtual machine. It has no registers for the
programmer to use. So it uses two stacks, one to hold the values and one to
hold the function calls.

This bothered me for a while because I don't like having two things so easily 
called `stack` so close in the codebase. Conceptually, trying to reason about 
stuff it was awkward as well. 

In the end the problem was solved by reading about *chained invocation frames*
and conceptually (and technically) shifting from a stack to a chain. Now, we
have the functional behavior of the invocation stack but it's not a stack, it's
a chain. Accomplished easily by having a pointer to the calling `Frame` (if
any) and this will eventually be passed back to the host as a *continuation* 
`Frame` so it will get executed on the next cycle.

#### continuations
Continuations are a powerful concept and they are often used if you're doing
functional programming. An Ambiance `Interpreter` has two methods: `exec`
and `exec1` that can be used to execute a frame.

The exact difference requires a bit of rambling about the inner workings of
Ambiance but if you're looking for the short version: as an end user you
should use `exec` because `exec1` is mostly for testing and not generally 
useful to call from a client perspective.

Function calls in Ambiance are all handled with continuations. There used
to be a difference between builtin functions and calling verbs (methods) on 
objects but that is all gone. The big difference between `exec` and `exec1` 
is that the latter will **never** produce a new record in the activation
chain (activation stack). If `exec1` encounters a scenario where a new
activation `Frame` would be involved it returns early passing along the
frame state so we can store it and resume later.

Consider calling the builtin function `log` which involves two frames. One
for the program that actually calls `log` and one for executing `log`
itself: 

    var p = [
        Op.IMM, 0, 0, 0, 0,     // 'log'
        Op.IMM, 0, 0, 0, 1,     // ['foo', 'bar', 'quux']
        Op.CALL_BI,
        Op.RETURN
    ];

If we execute this using `exec1` one we get the following result:

    [ { type: 0, v: 0 },
    Frame {
        ip: 11,
        stack: [],
        program:
        { main: <Buffer 00 00 00 00 00 00 00 00 00 01 09 0d>,
        forks: [],
        literals: [Object] },
        vector: -1,
        prev: null },
    [] ]
        
And although it might look daunting at first it basically boils down to 
`[result, continuation, [delayed]]`. We can deconstruct it easily using
TypeScript:

    let [result, cont, delayed] = exec1(new Frame(p));

Calling `exec1` will return a triple with three pieces of information. Let's
look at them:

##### `result`
This slot is reserved for the final result of a computation. For example in an
expression of `2 + 3` this would contain the `Val` of type `NUM` with `v` being 
`5`. In case of suspended or forked tasks there's no meaningful `Val` to return
so often you'll find it will just be a `NUM` with `v` being `0` to signal
everhting is fine.

##### `cont` 
This slot will have the `Frame` to *immediately* resume execution on. Whatever
happens, this is the number one priority because the client is expecting an 
immediate response still.

In the example above you can see we have a `cont` returned. Whenever we get one
we should execute it as fast a as possible.

##### `delayed`
This is an array of *delayed* frames. These are `DelayedFrame` instances that
have a pointer to the `Frame` to execute and a delay time in seconds. The host
is expected to push these onto a queue and execute them at a later point.

For example, we might `fork` (execute as a seperate task, possibly delayed) a few
tasks and then decide to `suspend` our own task for a while. In this case
the array of `delayed` frames will contain four `DelayedFrame` instances.   

There are no delayed tasks in the example above (the `log` builtin is immediate)
but the empty array is there.

#### suspending
One of the main features of LambdaMOO is the ability to `suspend` execution. 
Not only can this be used for effect (a delayed action) but also to prevent
trouble makers from hogging the server resources (by suspending their task).

The first versions of Ambiance implemented this operation as a special `Op`
(bytecode). In the original LambdaMOO however `suspend` is a builtin 
function. And with a few revisions it is also a builtin function now in
Amiance.

#### transparent box
The VM and all things related to it should be testable. If this means making
more methods visible than strictly desired we'll have to pay this price. It's 
the reason why `exec1` has to be documented.

The VM should not be a big huge thing. It should be a lightweight object that
is easily and readily instantiated (or obtained). When you design this thing 
you suddenly realize you need a lot of support services. It's tempting to make
the VM big and bloated and try to provide them yourself but it's really much
easier and much **much** more testable to inject each and everyone. Yes, your
constructor will get messy but if it's really bad you can always use 
dependency injection containers.  

### todo
* Built-in function references should not be strings, they should be pointers
into a function table.
* Inject all the services into the `Interpreter`, like objects (including
properties and verbs), tasks, io, utility and other related stuff.
* Actually design and implement those services as well.
* Documentation
* Lot's of other things to be added later.