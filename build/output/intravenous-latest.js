// Intravenous JavaScript library v0.1.0-beta
// (c) Roy Jacobs
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

(function(window,document,navigator,undefined){
function c(a){a="undefined"!==typeof a?a:{};a.version="0.1.0-beta";for(var b=["version"],d=a,e=0;e<b.length-1;e++)d=d[b[e]];d[b[b.length-1]]=a.version}"function"===typeof require&&"object"===typeof exports&&"object"===typeof module?c(module.exports||exports):"function"===typeof define&&define.amd?define(["exports"],c):(window.on=window.on||{},c(window.on.intravenous={}));!0;
})(window,document,navigator);
