# Intravenous
***
A lightweight zero-dependency [inversion of control container](http://martinfowler.com/articles/injection.html) for Javascript.

### What? Why?
If you are building complex applications it can become very difficult to manage object lifetimes and dependencies. For instance, if you're building a UI you may want to create a dialog. The dialog's model may have dependencies on a logger, Growlesque notification thing, etc. It'll probably also contain some sub-models to display inside the dialog. You need to track all these dependencies and when the dialog closes you want to dispose some of the models (but not all, since the logger is probably a singleton) and so on... Complex! Unless you use an IoC container like this one.

With *Intravenous* you create a _container_ and tell this container which services are available in your system. Then, when you have class that wants to use these services you simply list them as dependencies. You tell the container to create an instance of your class and all dependencies will be automatically resolved (even if your depedencies have dependencies of their own).

You can also create something called a _nested container_. In case of the dialog sample you would use this nested container to create all the view models that are only relevant during the dialog's lifetime. When the dialog closes, you can dispose the nested container and automatically all of the objects created by that container will be disposed as well. Still sounds complex? Read on!

### How do I include it?
It can be loaded as an CommonJS/Node.JS or AMD module. If you don't have either, it will be available as `window.intravenous`. It has no dependencies on other libraries.

### How do I use it?
1. Create a container like this:
```javascript
var container = intravenous.create();
```

1. Next, register some services (can be a constructor function or just an object):
```javascript
container.register("logger", loggerClass);
container.register("someGlobalData", { data: "hello" });
```

1. Then, define a class and its dependencies
```javascript
var myClass = function(logger, someGlobalData) {
  /* use logger here */
};
myClass.$inject = ["logger", "someGlobalData";
container.register("myClass", myClass);
```

1. Finally, get an instance to this class through the container:
```javascript
var myInstance = container.get("myClass");
```

You will now have an instance of `myClass` with all its dependencies resolved.

### What if a service doesn't exist?
It will throw an exception. Alternatively, you can specify optional (or nullable) dependencies by using the `?` suffix, like so:

```javascript
myClass.$inject = ["logger", "optionalDependency?"];
```

In this case `optionalDependency` will be injected as `null` if it doesn't exist.

### How can I control object disposal?
Pass in an `onDispose` handler when you create the container:
```javascript
var container = intravenous.create({
  onDispose: function(obj, serviceName) {
    obj.yourDisposeFunction();
  }
});
```

Now, whenever you are done with your container, call `dispose` on the container and it will call your `onDispose` callback for every object that needs to be disposed.

### What if I want to dispose only parts of the container, instead of everything?
Use a nested container and dispose that instead:
```javascript
var container = intravenous.create(/* onDispose handler here */);
var nested = container.create();
var myInstance = nested.get("myClass");
nested.dispose();
```

You can also register additional services on the nested container. They will override services registered on the parent container.

Creating a nested container is very lightweight so it's highly recommended to use them.

Please note that `container.create()` is not the same as `intravenous.create()`. The first creates a nested container, the second creates a completely new intravenous container. Typically in your application you will only need a single intravenous container.

### But how can I get access to the main intravenous container?
Take a dependency on the service called `container`, like so:

```javascript
var myClass = function(container) {
  var nested = container.create();
}
myClass.$inject = ["container", /* ... other dependencies */];
```

### How can I control the lifecycle of a service?
When registering a service using `register` it will default to the `perRequest` lifecycle. There are a number of different lifecycles you can use, though. They are listed below.

Let's say you have a service called `foo` and you are resolving an object `bar` that needs to resolve a large object graph to satisfy all its dependencies. It may mean `foo` is required in a lot of different places.

The available lifecycles:

1. `perRequest`: Regardless of how many times `foo` is required in the object graph, it is only created once. The next call to `container.get` will create a new `foo`, though.

2. `unique`: Every time `foo` is required in the object graph, a new instance is created.

3. `singleton`: As long as the container is not disposed, `foo` will only be created once. It will also be reused across multiple calls to `container.get`.

The lifecycle is specified as the third argument to `register`:
```javascript
container.register("logger", loggerClass, "singleton");
```

### How can I specify additional arguments?
When you want to pass additional to your class, simply add them to the `container.get` call:

```javascript
var myClass = function(logger, extra) {
  alert(extra);
};
myClass.$inject = ["logger"];
container.register("myClass", myClass);
var myInstance = container.get("myClass", "hello!");
```

This example will alert `hello!`.

### Can I also create instances of services I haven't yet registered?
No, not yet.

### Where did you get inspiration from?
The `$inject` syntax was inspired by [AngularJS](http://angularjs.org/). The nested container was a good idea pilfered from [StructureMap](http://www.structuremap.net).

### What's the license?
[MIT](http://www.opensource.org/licenses/mit-license.php).