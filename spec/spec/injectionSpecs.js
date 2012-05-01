describe("Injection", function () {
    beforeEach(function () {
		this.container = intravenous.create();
		
		var names = ["a", "a2", "a3"];
		for (var t=0;t<names.length;t++) {
			var name = names[t];
			this[name] = {
				data: name
			};
			this.container.register(name, this[name]);
		};
		
		this.b = function() {
			this.arguments = arguments;
		};
		this.container.register("b", this.b);
    });

	describe("supports multiple arguments", function() {
		beforeEach(function() {
			this.b.$inject = ["a", "a2", "a3"];
			this.retrievedB = this.container.get("b");
		});
		
		it("to inject the correct number of dependencies", function() {
			expect(this.retrievedB.arguments.length).toBe(3);
		});
		
		it("to be injected", function() {
			expect(this.retrievedB.arguments[0]).toBe(this.a);
			expect(this.retrievedB.arguments[1]).toBe(this.a2);
			expect(this.retrievedB.arguments[2]).toBe(this.a3);
		});
	});
	
	describe("supports the container", function() {
		beforeEach(function() {
			this.b.$inject = ["container"];
			this.retrievedB = this.container.get("b");
		});
		
		it("to inject the correct number of dependencies", function() {
			expect(this.retrievedB.arguments.length).toBe(1);
		});
		
		it("to be injected", function() {
			expect(this.retrievedB.arguments[0]).toBe(this.container);
		});
	});
	
	describe("supports unknown dependencies", function() {
		beforeEach(function() {
			this.b.$inject = ["a", "a4", "a3"];
		});
		
		it("to throw an exception when injected", function() {
			var _this = this;
			expect(function() { _this.retrievedB = _this.container.get("b"); }).toThrow("Unknown dependency: a4");
		});
	});
	
	describe("supports optional dependencies", function() {
		beforeEach(function() {
			this.b.$inject = ["a4?", "a3?"];
			this.retrievedB = this.container.get("b");
		});
		
		it("to be injected as null if not found", function() {
			expect(this.retrievedB.arguments[0]).toBe(null);
		});

		it("to be injected regularly if found", function() {
			expect(this.retrievedB.arguments[1]).toBe(this.a3);
		});
	});
	
	describe("does not support circular references", function() {
		beforeEach(function() {
			this.b.$inject = ["c"];
			
			this.c = function(b) {
				this.b = b;
			};
			this.c.$inject = ["b"];
			this.container.register("c", this.c);
		});
	
		it("to be injected", function() {
			var _this = this;
			expect(function() { _this.retrievedB = _this.container.get("b"); }).toThrow("Circular reference: b --> c --> b");
		});
	});
	
	describe("does not support circular references in multiple levels", function() {
		beforeEach(function() {
			this.b.$inject = ["c"];
			
			this.c = function(d) {
				this.d = d;
			};
			this.c.$inject = ["d"];
			this.container.register("c", this.c);
			
			this.d = function(b) {
				this.b = b;
			};
			this.d.$inject = ["b"];
			this.container.register("d", this.d);
		});
	
		it("to be injected", function() {
			var _this = this;
			expect(function() { _this.retrievedB = _this.container.get("b"); }).toThrow("Circular reference: b --> c --> d --> b");
		});
	});
	
	describe("passes in extra parameters", function() {
		beforeEach(function() {
			this.b.$inject = ["a"];
			this.retrievedB = this.container.get("b", "extra1", "extra2");
		});

		it("to inject the correct number of dependencies", function() {
			expect(this.retrievedB.arguments.length).toBe(3);
		});
		
		it("to be injected", function() {
			expect(this.retrievedB.arguments[0]).toBe(this.a);
			expect(this.retrievedB.arguments[1]).toBe("extra1");
			expect(this.retrievedB.arguments[2]).toBe("extra2");
		});
	});
});