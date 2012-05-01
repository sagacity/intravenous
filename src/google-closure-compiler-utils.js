// Google Closure Compiler helpers (used only to make the minified file smaller)
var exportSymbol = function(path, object) {
	var tokens = path.split(".");
	var target = intravenous;

	for (var i = 0; i < tokens.length - 1; i++)
		target = target[tokens[i]];
	target[tokens[tokens.length - 1]] = object;
};
var exportProperty = function(owner, publicName, object) {
  owner[publicName] = object;
};
