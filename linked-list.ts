/// <reference path="typings/tsd.d.ts" />

class LinkedListNode<T> {
	constructor(value: T, list: LinkedList<T> = null) {
		this.value = value;
		this.list = list;
	}
	
	value: T;
	list: LinkedList<T>;
	prev: LinkedListNode<T>;
	next: LinkedListNode<T>;
	
	detach(): LinkedListNode<T> {
		var self = this,
		    list = self.list,
			prev = self.prev,
			next = self.next;
			
		if (!list) {
			return this;
		}
		
		if (list.tail === this) {
			list.tail = prev;
		}
		
		if (list.head === this) {
			list.head = next;
		}
		
		if (list.head === list.tail) {
			list.tail = null;
		}
		
		if (prev) {
			prev.next = next;
		}
		
		if (next) {
			next.prev = prev;
		}
		
		self.prev = self.next = self.list = null;
		
		return self;
	}
	
	prepend(item: LinkedListNode<T>): LinkedListNode<T> {
		var self = this,
			list = self.list,
			prev = self.prev;
			
		if (!list) {
			return null;
		}
		
		item.detach();
		
		if (prev) {
			item.prev = prev;
			prev.next = item;
		}
		
		item.next = self;
		item.list = list;
		self.prev = item;
		
		if (self === list.head) {
			list.head = item;
		}
		
		if (!list.tail) {
			list.tail = self;
		}
		
		return item;
	}
	
	append(item: LinkedListNode<T>): LinkedListNode<T> {
		var self = this,
			list = self.list,
			next = self.next;
			
		if (!list) {
			return null;
		}
		
		item.detach();
		
		if (next) {
			item.next = next;
			next.prev = item;
		}
		
		item.prev = self;
		item.list = list;
		self.next = item;
		
		if (self === list.tail || !list.tail) {
			list.tail = item;
		}
		
		return item;
	}
}

class LinkedList<T> {
	head: LinkedListNode<T> = null;
	tail: LinkedListNode<T> = null;
	
	prepend(item: LinkedListNode<T>): LinkedListNode<T> {
		var self = this,
			head = self.head;
			
		if (head) {
			return head.prepend(item);
		}
		
		item.detach();
		
		item.list = self;
		self.head = item;
		
		return item;
	}
	
	append(item: LinkedListNode<T>): LinkedListNode<T> {
		var self = this,
			head = self.head,
			tail = self.tail;
			
		if (tail) {
			return tail.append(item);
		}
		
		head = self.head;
		
		if (head) {
			return head.append(item);
		}
		
		item.detach();
		
		item.list = self;
		self.head = item;
		
		return item;
	}
	
	filter(predicate?: (value:T) => boolean): LinkedListNode<T>[] {
		var item = this.head,
			result = [];

		predicate = predicate || (x => true);
			
		while (item) {
			if (predicate(item.value)) {
				result.push(item);
			}

			item = item.next;
		}
		
		return result;
	} 
}

export { LinkedList, LinkedListNode }
