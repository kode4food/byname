byname
======
[![Build Status](https://travis-ci.org/kode4food/byname.svg)](https://travis-ci.org/kode4food/byname)

A simple library, it lets you take a function, introspect (parse) its arguments, and invoke it with an options object instead of positional arguments.

## Directly Invoking a Function
So as a basic example, here is how you would invoke a function directly using `byname.invoke(targetFunction, options)`:

```javascript
var byname = require('byname');

function someFunction(name, value) {
  console.log("name = " + name);
  console.log("value = " + value);
}

byname.invoke(someFunction, {
  name: "This is the name",
  value: "This is the value"
});
```

## Wrapping a Function
You can also wrap the function using `byname.wrap(targetFunction)`. This will generate a wrapper function that can be used to invoke the target function repeatedly without having to perform introspection.

```javascript
var byname = require('byname');

function someFunction(name, value) {
  console.log("name = " + name);
  console.log("value = " + value);
}

var wrapped = byname.wrap(someFunction);
wrapped({
  name: "This is the name",
  value: "This is the value"
});
```

## Trailing Arguments
If you provide explicit arguments to the wrapped function, they will serve as the trailing arguments of the target function.  This is especially useful for providing a callback outside of the options object:

```javascript
var byname = require('byname');

function someFunction(name, value, callback) {
  var result = "name = " + name + " / value = " + value;
  callback(null, result);
}

var wrapped = byname.wrap(someFunction);
wrapped({
  name: "This is the name",
  value: "This is the value"
}, handler);

function handler(err, result) {
  console.log(result);
}
```

## Explicitly Naming Arguments
If you don't like the argument names you've chosen for your target function, or if it has been bound and the argument names lost, you can explicitly set the names used.  It's even good for mapping some arbitrary object to a function's arguments:

```javascript
var byname = require('byname');

function someFunction(name, value) {
  console.log("name = " + name);
  console.log("value = " + value);
}

var wrapped = byname.wrap(someFunction, "n", "v");
wrapped({
  n: "This is the name",
  v: "This is the value"
});
```

## Default Argument Values
Perhaps you need default values?  The wrapped function exposes a couple of utility functions, one of which is `withDefaults(defaults)`.  It returns an augmented version of the wrapper that provides defaults for any arguments not specific upon invocation:

```javascript
var byname = require('byname');

function someFunction(name, value) {
  console.log("name = " + name);
  console.log("value = " + value);
}

var defaulted = byname.wrap(someFunction).withDefaults({
  value: "This is the value"
});

defaulted({
  name: "This is the name"
});
```

`withDefaults(defaults)` will accept either an object or a function that returns an object.  If provided a function to generate defaults, that function will be invoked every time the wrapped function is called.

## Retrieving Argument Names
The other is `getArgumentNames()` which can be used to return the names of the wrapped function's introspected arguments:

```javascript
var byname = require('byname');

function someFunction(name, value) {
}

var wrapped = byname.wrap(someFunction);

console.log(wrapped.getArgumentNames());
```

## Options is Optional
If you do not include an object as your first argument, any arguments specified will continue to be treated as trailing arguments, and an empty options object will be assumed:

```javascript
var byname = require('byname');

function someFunction(name, value, callback) {
  var result = "name = " + name + " / value = " + value;
  callback(null, result);
}

var wrapped = byname.wrap(someFunction);
// invoke someFunction with name and value undefined
wrapped(handler);

function handler(err, result) {
  console.log(result);
}
```

This behavior also applies to interfaces create using `withDefaults(defaults)`.

## License (MIT License)
Copyright (c) 2015 Thomas S. Bradford

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
