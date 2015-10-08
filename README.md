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

### todo
* Built-in function references should not be strings, they should be pointers
into a function table.
* Inject all the services into the `Interpreter`, like objects (including
properties and verbs), tasks, io, utility and other related stuff.
* Lot's of other things to be added later.