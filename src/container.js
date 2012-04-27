(function() {
	"use strict";
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var registration = function(key, value, lifecycle) {
		this.key = key;
		this.value = value;
		this.lifecycle = lifecycle;
		this.refCount = 0;
	};
	registration.prototype = {
		addRef: function() {
			this.refCount++;
		},
		release: function() {
			if (!this.refCount) throw new Error("Cannot release object with zero refCount!");
			this.refCount--;
		}
	};
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var container = function(options) {
		this.registry = {};
		this.instances = [];

		options = options || {};
		this.options = options;
		
		this.register("container", this);
	};
	
	var pushInstance = function(container, reg, instance) {
		reg.addRef();
		container.instances.push({
			registration: reg,
			instance: instance
		});
	};
	
	var get = function(container, key, extraInjections, visitedKeys, visitedKeysArray) {
		var isOptional = (key && key.substr(-1) === "!");
		if (isOptional) key = key.slice(0, -1);
	
		var reg = container.registry[key];
		if (!reg) {
			if (isOptional) return null;
			else throw new Error("Unknown dependency: " + key);
		}
		
		visitedKeys = visitedKeys || {};
		visitedKeysArray = visitedKeysArray || [];
		visitedKeysArray.push(key);
		if (visitedKeys[key]) {
			throw new Error("Circular reference: " + visitedKeysArray.join(" --> "));
		}
		visitedKeys[key] = true;
		
		var instance;

		for (var t=0,len = container.instances.length;t<len;t++) {
			var i = container.instances[t];
			if (i.registration.key === key) {
				if (!i.instance) break;
				pushInstance(container, i.registration, i.instance);
				return i.instance;
			}
		};
		
		if (reg.value instanceof Function) {
			// The registered value is a constructor, so we need to construct the object and inject all the dependencies.
			var injections = reg.value.$inject;
			var resolvedInjections = [];
			if (injections instanceof Array) {
				for (var t=0,len = injections.length;t<len;t++) {
					var injectionKey = injections[t];
					resolvedInjections.push(get(container, injectionKey, [], visitedKeys, visitedKeysArray));
				}
			}

			var temp = function() {};
			temp.prototype = reg.value.prototype;
			instance = new temp;
			
			for (var t=0,len = extraInjections.length;t<len;t++) {
				resolvedInjections.push(extraInjections[t]);
			}
			
			reg.value.apply(instance, resolvedInjections);
		} else {
			// The registered value is an existing instance.
			instance = reg.value;
		}

		if (DEBUG) instance.$registration = reg;

		pushInstance(container, reg, instance);
		return instance;
	};
	
	container.prototype = {
		register: function(key, value, lifecycle) {
			if (key && key.substr(-1) === "!") throw new Error("Cannot register dependency: " + key);
			var reg = new registration(key, value, lifecycle);
			this.registry[key] = reg;
		},
		
		get: function(key) {
			var extraInjections = Array.prototype.slice.call(arguments).slice(1);
			return get(this, key, extraInjections);
		},
		
		dispose: function() {
			var reg;
			while (reg = this.instances.pop()) {
				reg.registration.release();
				if (!reg.registration.refCount && this.options.onDispose && reg.instance) {
					this.options.onDispose(reg.instance, reg.registration.key);
				}
			}
			return true;
		}
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$.create = function(options) {
		return new container(options);
	};
	
	exportSymbol("create", $.create);
}());

