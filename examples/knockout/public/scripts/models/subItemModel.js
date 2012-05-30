define(["ko"], function(ko) {
	var model = function(log, id) {
		this.log = log;
		this.id = id;
		
		this.dispose = function() {
			this.log.add("subItemModel for " + id + " disposed");
		};
		
		this.log.add("subItemModel for " + id + " initialized");
	};
	
	model.$inject = ["log", "item/id"];
	return model;
});