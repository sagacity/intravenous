var myClass = function(dependency, nonExistentDependency, extraParameter) {
	console.log("myClass constructed");

	console.log("dependency: " + dependency);
	console.log("nonExistentDependency: " + nonExistentDependency);
	console.log("extraParameter: " + extraParameter);
};
myClass.prototype.dispose = function() {
	console.log("Disposing myClass!");
};
myClass.$inject = ["myDependency", "someUnknownDependency?"];
module.exports = myClass;