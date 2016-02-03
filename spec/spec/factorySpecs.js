describe("A factory", function() {
    beforeEach(function() {
        var _this = this;

        this.disposalCount = {};
        this.baseContainer = intravenous.create({
            onDispose: function(obj, key) {
                if (!_this.disposalCount[key]) _this.disposalCount[key] = 0;
                _this.disposalCount[key]++;
            }
        });

		this.baseContainer.register("dependency", "d");

		this.a = function(dependency, parameter) {
			this.dependency = dependency;
			this.parameter = parameter;
		};
		this.a.$inject = ["dependency"];
        this.baseContainer.register("a", this.a);

        this.b = function(aFactory) {
			var _this = this;
			this.aFactory = aFactory;
			this.a = aFactory.get("extraParameter");
			this.a2 = aFactory.use("dependency", "d2").get("extraParameter");

			this.aDispose = function() {
				aFactory.dispose(_this.a);
			};

			this.a2Dispose = function() {
				aFactory.dispose(_this.a2);
			};
		};
        this.b.$inject = ["a!"];

        this.baseContainer.register("b", this.b);
    });

    describe("when invoked", function() {
        beforeEach(function() {
            this.retrievedB = this.baseContainer.get("b");
        });

        it("should have created an instance", function() {
            expect(this.retrievedB).not.toBeFalsy();
        });

        it("should have created two factory instances", function() {
            expect(this.retrievedB.a).not.toBeFalsy();
			expect(this.retrievedB.a2).not.toBeFalsy();
		});

		it("should have passed on extra parameters", function() {
			expect(this.retrievedB.a.parameter).toBe("extraParameter");
		});

		it("should have overridden the dependency on the second factory instance", function() {
			expect(this.retrievedB.a2.dependency).toBe("d2");
		});

		describe("and when disposed the first factory instance", function() {
			beforeEach(function() {
				this.retrievedB.aDispose();
			});

			it("should have only disposed the first factory instance", function() {
				expect(this.disposalCount.a).toBe(1);
			});

			it("should not have disposed the instance", function() {
				expect(this.disposalCount.b).toBeUndefined();
			});

			it("should release the first container", function() {
				expect(this.retrievedB.aFactory.container.children.length).toBe(1);
				expect(this.retrievedB.aFactory.container.children[0]).toBe(this.retrievedB.a2.$containerFactoryInstance.container);
			});
		});

		describe("and when disposed both factory instances", function() {
			beforeEach(function() {
				this.retrievedB.aDispose();
				this.retrievedB.a2Dispose();
			});

			it("should have disposed both factory instances", function() {
				expect(this.disposalCount.a).toBe(2);
			});

			it("should not have disposed the instance", function() {
				expect(this.disposalCount.b).toBeUndefined();
			});

			it("should release both containers", function() {
				expect(this.retrievedB.aFactory.container.children.length).toBe(0);
			});
		});
	});
})
