describe("A container", function () {
    beforeEach(function () {
		var _this = this;
		
		this.disposalCount = {};
		this.container = $.create({
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
            expect(this.container.instances.length).toBe(0);
        });

        describe("registers an instance in the container", function() {
            beforeEach(function() {
                this.retrievedA = this.container.get("a");
            });

            it("should have an instance", function() {
                expect(this.container.instances.length).toBe(1);
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
		
		describe("that is retrieved through injection in two similar classes", function() {
			beforeEach(function() {
				this.retrievedB = this.container.get("b");
				this.retrievedB2 = this.container.get("b");
			});
			
			it("should be equal to the original", function() {
				expect(this.retrievedB.a).toBe(this.retrievedB2.a);
			});
		});
		
		describe("that is retrieved through injection in two different classes", function() {
			beforeEach(function() {
				this.retrievedB = this.container.get("b");
				this.retrievedC = this.container.get("c");
			});
			
			it("should be equal to the original", function() {
				expect(this.retrievedB.a).toBe(this.retrievedC.a);
			});
			
			it("should have a refCount of 2", function() {
				expect(this.a.$registration.refCount).toBe(2);
			});

			describe("and whose container is then disposed", function() {
				beforeEach(function() {
					this.container.dispose();
				});
				
				it("should be disposed", function() {
					expect(this.disposalCount.a).toBe(1);
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
			
			it("should be equal to the original", function() {
				expect(this.retrievedB.a).toBe(this.retrievedB2.a);
			});
		});
		
		describe("that is retrieved through injection in two different classes", function() {
			beforeEach(function() {
				this.retrievedB = this.container.get("b");
				this.retrievedC = this.container.get("c");
			});
			
			it("should be equal to the original", function() {
				expect(this.retrievedB.a).toBe(this.retrievedC.a);
			});
			
			describe("and whose container is then disposed", function() {
				beforeEach(function() {
					this.container.dispose();
				});
				
				it("should be disposed", function() {
					expect(this.disposalCount.a).toBe(1);
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
});