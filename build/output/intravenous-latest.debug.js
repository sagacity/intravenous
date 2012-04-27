// Intravenous JavaScript library v0.1.0-beta
// (c) Roy Jacobs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

(function(window,document,navigator,undefined){
var DEBUG=true;
!function(factory) {
    // Support three module loading scenarios
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // [1] CommonJS/Node.js
        var target = module['exports'] || exports; // module.exports is for Node.js
        factory(target);
    } else if (typeof define === 'function' && define['amd']) {
        // [2] AMD anonymous module
        define(['exports'], factory);
    } else {
        // [3] No module loader (plain <script> tag) - put directly in global namespace
		window['on'] = window['on'] || {};
        factory(window['on']['intravenous'] = {});
    }
}(function(exports){
var $ = typeof exports !== 'undefined' ? exports : {};
// Google Closure Compiler helpers (used only to make the minified file smaller)
var exportSymbol = function(path, object) {
	var tokens = path.split(".");
	var target = $;

	for (var i = 0; i < tokens.length - 1; i++)
		target = target[tokens[i]];
	target[tokens[tokens.length - 1]] = object;
};
var exportProperty = function(owner, publicName, object) {
  owner[publicName] = object;
};
$.version = "0.1.0-beta";
exportSymbol('version', $.version);
});
})(window,document,navigator);
