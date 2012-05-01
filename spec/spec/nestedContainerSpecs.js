describe("A nested container", function() {
    beforeEach(function() {
        var _this = this;

        this.baseContainer = $.create({
            onDispose: function() {}
        });
        this.baseContainer.register("a", "a");
    });

    describe("when created", function() {
        beforeEach(function() {
            this.container = this.baseContainer.create();
            this.container = this.container.create(); // nest another level
            this.container.register("b", "b");

            this.d = function(a, b, c) {
                this.a = a;
                this.b = b;
                this.c = c;
            };
            this.d.$inject = ["a", "b", "c?"];
            this.container.register("d", this.d);
        });

        it("can be created from base container", function() {
            expect(this.container).toBeDefined();
        });

        it("takes the base container options when not overridden", function() {
            expect(this.container.options).toEqual(this.baseContainer.options);
        });

        it("retrieves the same instances", function() {
            expect(this.container.get("a")).toBe(this.baseContainer.get("a"));
        });

        it("retrieves itself for a container dependency", function() {
           expect(this.container.get("container")).toBe(this.container);
        });

        describe("when retrieving an instance", function() {
            beforeEach(function() {
                this.d = this.container.get("d");
            });

            it("retrieves an instance from the base container", function() {
                expect(this.d.a).toEqual("a");
            });

            it("retrieves an instance from the container", function() {
                expect(this.d.b).toEqual("b");
            });

            it("still allows nullable dependencies", function() {
                expect(this.d.c).toBeNull();
            });
        });
    });

    describe("when created with overridden options", function() {
        beforeEach(function() {
            this.container = this.baseContainer.create({
                onDispose: function() {}
            });
        });

        it("does not take the base container options", function() {
            expect(this.container.options).not.toEqual(this.baseContainer.options);
        });
    });
});