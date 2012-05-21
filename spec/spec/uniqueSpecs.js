describe("A unique registration", function() {
    beforeEach(function() {
        var _this = this;

        this.constructionCount = 0;
        this.container = intravenous.create();

        this.a = function() {
            _this.constructionCount++;
        };
        this.container.register("a", this.a, "unique");
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

        it("should construct the object every time", function() {
            expect(this.constructionCount).toEqual(2);
        });
    });
});