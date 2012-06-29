describe("A container", function () {
    beforeEach(function () {
		var _this = this;
		
		this.disposalCount = {};
		this.container = intravenous.create({
			onDispose: function(obj, key) {
				if (!_this.disposalCount[key]) _this.disposalCount[key] = 0;
				_this.disposalCount[key]++;
			}
		});
    });
	
	it("can be constructed", function() {
		expect(this.container).toBeDefined();
	});
	
	it("only has the container registered", function() {
		expect(this.container.get("container")).toBe(this.container);
	});
	
	it("can be disposed", function() {
		expect(this.container.dispose()).toBeTruthy();
	});
	
	it("does not allow to register dependencies ending with '?'", function() {
		var _this = this;
		expect(function() { _this.container.register("a?", {}); }).toThrow("Cannot register dependency: a?");
	});
	
	describe("containing an object registration", function() {
		beforeEach(function() {
			this.a = {
				data: "data"
			};
			this.container.register("a", this.a);
			
			this.b = function(a) {
				this.a = a;
			};
			this.b.$inject = ["a"];
			this.container.register("b", this.b);

			this.c = function(a) {
				this.a = a;
			};
			this.c.$inject = ["a"];
			this.container.register("c", this.c);
		});

        it("should have no instances", function() {
            expect(this.container.getCachedObjects().length).toBe(0);
        });

        describe("registers an instance in the container", function() {
            beforeEach(function() {
                this.retrievedA = this.container.get("a");
            });

            it("should have an instance", function() {
                expect(this.container.getCachedObjects().length).toBe(1);
            });
        });
		
		describe("that is retrieved through 'get'", function() {
			beforeEach(function() {
				this.retrievedA = this.container.get("a");
			});
			
			it("should be equal to the original", function() {
				expect(this.retrievedA).toBe(this.a);
			});
		});
		
		describe("that is retrieved through injection", function() {
			beforeEach(function() {
				this.retrievedB = this.container.get("b");
			});
			
			it("should be equal to the original", function() {
				expect(this.retrievedB.a).toBe(this.a);
			});
        });

		describe("that is unused in a disposed container", function() {
			beforeEach(function() {
				this.container.dispose();
			});
			
			it("is never instantiated", function() {
				expect(this.disposalCount.a).toBeUndefined();
			});
		});
	});

	describe("containing a constructor registration", function() {
		beforeEach(function() {
			this.a = function() {
				this.data = "data";
			};
			this.container.register("a", this.a);
			
			this.b = function(a) {
				this.a = a;
			};
			this.b.$inject = ["a"];
			this.container.register("b", this.b);
			
			this.c = function(a) {
				this.a = a;
			};
			this.c.$inject = ["a"];
			this.container.register("c", this.c);
		});
		
		describe("that is retrieved through injection in two similar classes", function() {
			beforeEach(function() {
				this.retrievedB = this.container.get("b");
				this.retrievedB2 = this.container.get("b");
			});
			
			it("should not be equal to the original", function() {
				expect(this.retrievedB.a).not.toBe(this.retrievedB2.a);
			});
		});
		
		describe("that is retrieved through injection in two different classes", function() {
			beforeEach(function() {
				this.retrievedB = this.container.get("b");
				this.retrievedC = this.container.get("c");
			});
			
			it("should not be equal to the original", function() {
				expect(this.retrievedB.a).not.toBe(this.retrievedC.a);
			});
			
			describe("and whose container is then disposed", function() {
				beforeEach(function() {
					this.container.dispose();
				});
				
				it("should be disposed", function() {
					expect(this.disposalCount.a).toBe(2);
					expect(this.disposalCount.b).toBe(1);
					expect(this.disposalCount.c).toBe(1);
				});
			});
		});
		
		describe("that is unused in a disposed container", function() {
			beforeEach(function() {
				this.container.dispose();
			});
			
			it("is never instantiated", function() {
				expect(this.disposalCount.a).toBeUndefined();
			});
		});
	});

	describe("containing a custom class", function() {
		beforeEach(function() {
			var _this = this;

			this.a = function(b) {
				_this.b = b;
				function MyClass() {
					this.name = "bob";
				};
				MyClass.staticProperty = "static";

				// Uncommenting this line makes the test not even run.
				MyClass.prototype.localMethod = function() { 
					return "method";
				};

				return MyClass;
			};
			this.container.register("b", "b");
			this.a.$inject = ["b"];

			this.container.register("MyClass", this.a);
		});

		it("should have injected dependencies", function() {
			var MyClass = this.container.get("MyClass");
			expect(this.b).toBe("b");
		});

		it("should call the constructor", function() {
			var MyClass = this.container.get("MyClass");
			var instance = MyClass.get();
			expect(instance.name).toBe("bob");
		});

		it("should preserve static properties", function() {
			var MyClass = this.container.get("MyClass");
			expect(MyClass.staticProperty).toBe("static");
		});

		it("should preserve prototype properties", function() {
			var MyClass = this.container.get("MyClass");
			var instance = MyClass.get();
			expect(instance.localMethod()).toBe("method");
		});

		// Not implemented yet
		xit("should let you use new if you want", function() {
		    var MyClass = this.container.get("MyClass");
		    var instance = new MyClass();
		    expect(instance.name).toBe("bob");
		});

		// Not implemented yet
		xit("should give you a copy of the constructor", function() {
			var MyClass = this.container.get("MyClass");
			var instance = MyClass.get();
			expect(instance instanceof MyClass).toBe(true);
		});

		describe("that is disposed", function() {
			beforeEach(function() {
				var MyClass = this.container.get("MyClass");
				var a1 = MyClass.get();
				var a2 = MyClass.get();
				this.container.dispose();
			});

			it("should properly dispose", function() {
				// Disposed 2 times the instance of 'a', and 1 time the factory of 'a'
				expect(this.disposalCount.MyClass).toBe(3);
				expect(this.disposalCount.b).toBe(1);
			});
		});
	});
});