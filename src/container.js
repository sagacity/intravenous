(function() {
	"use strict";

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var registration = function(key, container, value, lifecycle) {
		this.key = key;
		this.container = container;
		this.value = value;
		this.lifecycle = lifecycle;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var cacheItem = function(reg, instance) {
		this.registration = reg;
		this.instance = instance;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var perRequestLifecycle = function(container) {
		this.container = container;
		this.cache = [];
		this.refCounts = {};

		this.tag = 0;
		this.visitedKeys = {};
		this.visitedKeysArray = [];
	};

	perRequestLifecycle.prototype = {
		get: function(key) {
			// Gets an instance for 'key' that has already been retrieved during the current resolve. The current resolve is identified by 'tag'.
			// If there is no available instance, it will also do a check to determine if there's a circular reference during.
			for (var t=0,len = this.cache.length;t<len;t++) {
				var i = this.cache[t];
				if (i.registration.key === key && i.tag === this.tag) {
					if (!i.instance) break;
					this.set(i);
					return i.instance;
				}
			}

			this.visitedKeysArray.push(key);
			if (this.visitedKeys[key]) {
				throw new Error("Circular reference: " + this.visitedKeysArray.join(" --> "));
			}
			this.visitedKeys[key] = true;

			return null;
		},

		set: function(cacheItem) {
			this.cache.push(cacheItem);
			this.refCounts[cacheItem.registration.key] = this.refCounts[cacheItem.registration.key]++ || 1;
			cacheItem.tag = this.tag;
		},

		release: function(cacheItem) {
			return !--this.refCounts[cacheItem.registration.key];
		},

		resolveStarted: function(key) {
			this.tag++;
			this.visitedKeys = {};
			this.visitedKeysArray = [];
		}
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var singletonLifecycle = function(container) {
		this.container = container;
		this.cache = [];
	};

	singletonLifecycle.prototype = {
		get: function(key) {
			// Re-use any instance that is already available for this dependency
			for (var t=0,len = this.cache.length;t<len;t++) {
				var i = this.cache[t];
				if (i.registration.key === key) {
					if (!i.instance) break;
					this.set(i);
					return i.instance;
				}
			}

			return null;
		},

		set: function(cacheItem) {
			this.cache.push(cacheItem);
		},

		release: function(cacheItem) {
			return cacheItem.registration.container === this.container;
		},

		resolveStarted: function(key) {
		}
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var uniqueLifecycle = function(container) {
		this.container = container;
		this.cache = [];
	};

	uniqueLifecycle.prototype = {
		get: function(key) {
			return null;
		},

		set: function(cacheItem) {
			this.cache.push(cacheItem);
		},

		release: function(cacheItem) {
			return true;
		},

		resolveStarted: function(key) {
		}
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var container = function(options, parent) {
		this.registry = {};
		this.parent = parent;
		this.lifecycles = {
			perRequest: new perRequestLifecycle(this),
			singleton: new singletonLifecycle(this),
			unique: new uniqueLifecycle(this)
		};
		this.children = [];

		options = options || {};
		this.options = options;

		this.register("container", this);
	};

	var getKeyOption = function(key) {
		if (key) {
			switch (key.substr(-1)) {
				case "?":
					return "nullable";
			}
		}

		return null;
	};

	var get = function(container, key, extraInjections) {
		var keyOption = getKeyOption(key);
		if (keyOption) key = key.slice(0, -1);

		// Try to find the dependency registration in the current container.
		// If not found, recursively try the parent container.
		var reg;
		var currentContainer = container;
		while (currentContainer && !reg) {
			reg = currentContainer.registry[key];
			if (!reg) currentContainer = currentContainer.parent;
		}
		if (!reg) {
			if (keyOption === "nullable") return null;
			else throw new Error("Unknown dependency: " + key);
		}

		// Ask the lifecycle if it already has an instance of this dependency
		var instance;
		if (instance = container.lifecycles[reg.lifecycle].get(key)) {
			return instance;
		}

		// Lifecycle didn't have an instance, so we need to create it.
		// If the registered value is a function we use it as a constructor.
		// Otherwise, we simply return the registered value.
		if (reg.value instanceof Function) {
			// The registered value is a constructor, so we need to construct the object and inject all the dependencies.
			var injections = reg.value.$inject;
			var resolvedInjections = [];
			if (injections instanceof Array) {
				for (var t=0,len = injections.length;t<len;t++) {
					var injectionKey = injections[t];
					resolvedInjections.push(get(container, injectionKey, []));
				}
			}

			var InjectedInstance = function() {};
			InjectedInstance.prototype = reg.value.prototype;
			instance = new InjectedInstance;

			for (t=0,len = extraInjections.length;t<len;t++) {
				resolvedInjections.push(extraInjections[t]);
			}

			reg.value.apply(instance, resolvedInjections);
		} else {
			// The registered value is an existing instance.
			instance = reg.value;
		}

		container.lifecycles[reg.lifecycle].set(new cacheItem(reg, instance));
		return instance;
	};

	container.prototype = {
		register: function(key, value, lifecycle) {
			if (getKeyOption(key)) throw new Error("Cannot register dependency: " + key);
			this.registry[key] = new registration(key, this, value, lifecycle || "perRequest");
		},

		get: function(key) {
			for (var lifecycleName in this.lifecycles) {
				if (this.lifecycles.hasOwnProperty(lifecycleName)) this.lifecycles[lifecycleName].resolveStarted(key);
			}

			var extraInjections = Array.prototype.slice.call(arguments).slice(1);

			var container = this;
			var value;
			while (container && (value = get(container, key, extraInjections)) === null) {
				container = container.parent;
			}

			return value;
		},

		dispose: function() {
			var item;

			while (item = this.children.pop()) {
				item.dispose();
			}

			var cache = this.getCachedObjects();
			while (item = cache.pop()) {
				if (this.lifecycles[item.registration.lifecycle].release(item)) {
					if (this.options.onDispose) {
						this.options.onDispose(item.instance, item.registration.key);
					}
				}
			}
			return true;
		},

		create: function(options) {
			options = options || {};
			options.onDispose = options.onDispose || this.options.onDispose;
			var child = new container(options, this);
			this.children.push(child);
			return child;
		},

		getCachedObjects: function() {
			var result = [];
			for (var lifecycleName in this.lifecycles) {
				if (this.lifecycles.hasOwnProperty(lifecycleName)) result = result.concat(this.lifecycles[lifecycleName].cache);
			}
			return result;
		}
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	intravenous.create = function(options) {
		return new container(options);
	};

	exportSymbol("create", intravenous.create);
}());

