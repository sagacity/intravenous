var myDependency = function() {
	console.log("myDependency constructed");
};
myDependency.prototype.dispose = function() {
	console.log("Disposing myDependency!");
};
module.exports = myDependency;