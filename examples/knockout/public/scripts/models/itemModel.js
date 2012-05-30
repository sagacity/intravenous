define(["ko"], function(ko) {
	var itemId = 0;

	var model = function(log, subItemFactory) {
		var _this = this;
		
		this.log = log;
		this.id = ++itemId;
		
		// We create subItem through its factory so we can pass in extra dependencies. In this case we simply pass in the ID of this item.
		this.subItem = subItemFactory.use("item/id", this.id).get();
		
		// The "isDisposed" observable will be set to true when the model is disposed.
		// This can be used to automatically dispose all computed's the model may have, thereby releasing any subscriptions.
		this.isDisposed = ko.observable(false);
		this.myComputed = ko.computed(function() {
			return this.id;
		}, this, { disposeWhen: this.isDisposed });
		
		// The "dispose" method will be invoked when the item is disposed from the itemFactory in appModel.
		// Note: When we get here, subItem will already have been disposed automatically! You don't need to release any dependencies yourself.
		this.dispose = function() {
			// Setting the isDisposed to true to allow the computeds to release themselves.
			this.isDisposed(true);
			this.log.add("itemModel " + this.id + " disposed");
		};

		this.log.add("itemModel " + this.id + " initialized");
	};
	
	model.$inject = ["log", "subItemFactory"];
	return model;
});