define(["ko"], function(ko) {
	var model = function(log, itemFactory) {
		var _this = this;
		
		this.log = log;
		
		// Here is some logic that allows the application to dynamically add and remove items.
		this.itemFactory = itemFactory;
		this.items = ko.observableArray();
		this.itemCount = ko.computed(function() {
			return this.items().length;
		}, this);
		
		this.addItem = function() {
			this.items.push(this.itemFactory.get());
		};
		
		// When we remove an item we should also let the itemFactory know that it has been disposed.
		// This will in turn release all of the item's dependencies.
		this.removeItem = function() {
			var item = this;
			_this.items.remove(item);
			_this.itemFactory.dispose(item);
		};
		
		this.log.add("appModel initialized");
	};
	
	model.$inject = ["log", "itemFactory"];
	return model;
});