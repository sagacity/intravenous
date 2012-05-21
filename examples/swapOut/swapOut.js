var container;

var createContainer = function() {
    container = intravenous.create();
};

var registerWriterClasses = function() {
    container.register("consoleWriter", function() {
        this.write = function(msg) {
            console.log(msg);
        }
    });

    container.register("alertWriter", function() {
        this.write = function(msg) {
            alert(msg);
        }
    });
};

var registerLoggerClass = function(dependencies) {
    var myLogger = function(writer) {
        this.log = function(msg) {
            writer.write(msg);
        };
    };
    myLogger.$inject = dependencies;
    container.register("logger", myLogger);
};

var doLog = function() {
    var logger = container.get("logger");
    logger.log("Hello!");
};

var consoleDemo = function() {
    createContainer();
    registerWriterClasses();
    registerLoggerClass(["consoleWriter"]);
    doLog();
};

var alertDemo = function() {
    createContainer();
    registerWriterClasses();
    registerLoggerClass(["alertWriter"]);
    doLog();
};
