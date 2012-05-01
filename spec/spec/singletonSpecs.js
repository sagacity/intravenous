describe("A singleton registration", function() {
    beforeEach(function() {
        var _this = this;

        this.constructionCount = 0;
        this.container = intravenous.create();

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
    });
});