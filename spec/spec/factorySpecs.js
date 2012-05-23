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
        this.baseContainer.register("a", "a");

        this.b = function(aFactory) {
            this.a = aFactory(1, 2, 3);
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

        it("should have created a factory instance", function() {
            expect(this.retrievedB.a).toBe("a");
        });
    });
})
