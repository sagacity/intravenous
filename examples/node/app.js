var intravenous = require("intravenous"),
	myClass = require("./myClass"),
	myDependency = require("./myDependency");

var container = intravenous.create({
	onDispose: function(instance, key) {
		console.log("Calling dispose method for service " + key);
		if (instance.dispose) instance.dispose();
	}
});

container.register("myClass", myClass);
container.register("myDependency", myDependency);

var instance = container.get("myClass", "hello");
container.dispose();