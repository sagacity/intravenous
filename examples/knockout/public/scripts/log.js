define(["ko"], function(ko) {
	var model = function() {
		this.contents = ko.observable("");
		this.add = function(text) {
			var contents = this.contents();
			if (contents) contents += "\n";
			
			// Timestamp the incoming line
			var pad = function(val) {
				var s = val.toString();
				return s.length < 2 ? "0" + s : s
			}
			
			var date = new Date();
			var timestamp = pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds());
			text = timestamp + " --> " + text;
			contents += text;
			
			this.contents(contents);
		};
		
		this.add("Log created");
	};
	return model;
});