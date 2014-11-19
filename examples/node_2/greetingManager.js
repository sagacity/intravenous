var GreetingManager = function(greeter){

	this.salute = function(name){
		return greeter.salute(name);
	};
	
};
GreetingManager.$inject = ["greeter"];
module.exports = GreetingManager;