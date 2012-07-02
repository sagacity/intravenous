describe("A singleton registration", function() {
    beforeEach(function() {
        var _this = this;

        this.constructionCount = 0;
        this.disposalCount = {};
        this.container = intravenous.create({
            onDispose: function(obj, key) {
                if (!_this.disposalCount[key]) _this.disposalCount[key] = 0;
                _this.disposalCount[key]++;
            }
        });

        this.a = function() {
            _this.constructionCount++;
        };
        this.container.register("a", this.a, "singleton");
    });

    describe("when created multiple times", function() {
        beforeEach(function() {
            this.retrievedA = this.container.get("a");
            this.retrievedA_ = this.container.get("a");
        });

        it("should only construct the object once", function() {
            expect(this.constructionCount).toEqual(1);
        });

        describe("and disposed again", function() {
            beforeEach(function() {
                this.container.dispose();
            })

            it("should only dispose the object once", function() {
                expect(this.disposalCount.a).toEqual(1);
            });
        });
    });
});