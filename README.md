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

### todo
* Built-in function references should not be strings, they should be pointers
into a function table.
* Inject all the services into the `Interpreter`, like objects (including
properties and verbs), tasks, io, utility and other related stuff.
* Actually design and implement those services as well.
* Documentation
* Lot's of other things to be added later.