describe("A per-request registration", function() {
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
        this.container.register("a", this.a);
    });

    describe("when created multiple times", function() {
        beforeEach(function() {
            this.retrievedA = this.container.get("a");
            this.retrievedA_ = this.container.get("a");
        });

        it("should construct the object twice", function() {
            expect(this.constructionCount).toEqual(2);
        });

        describe("after disposal", function() {
            beforeEach(function() {
                this.container.dispose();
            });

            it("should dispose two objects", function() {
                expect(this.disposalCount.a).toBe(2);
            });
        });
    });

    describe("when used in multiple dependencies", function() {
        beforeEach(function() {
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

            this.d = function(b, c) {
            };
            this.d.$inject = ["b", "c"];
            this.container.register("d", this.d);

            this.retrievedD = this.container.get("d");
        });

        it("should only construct the object once", function() {
            expect(this.constructionCount).toEqual(1);
        });
    });
});