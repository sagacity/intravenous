define(["ko", "intravenous", "domReady", "log", "models/appModel", "models/itemModel", "models/subItemModel"], function(ko, intravenous, domReady, log, appModel, itemModel, subItemModel) {
	domReady(function() {
		// We configure the container in such a way that we call any "dispose" methods that may be present on our models.
		var container = intravenous.create({
			onDispose: function(instance, key) {
				if (instance.dispose) instance.dispose();
			}
		});
		
		// Register all the components of our application. Because "log" is a singleton, it will be reused among all components.
		container.register("log", log, "singleton");
		container.register("app", appModel);
		container.register("item", itemModel);
		container.register("subItem", subItemModel);
		
		// Finally, we get the main model and use that as our main viewmodel.
		ko.applyBindings(container.get("app"));
	});
});
