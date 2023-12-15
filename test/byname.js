"use strict";

var nodeunit = require('nodeunit');
var byname = require('../index');

exports["By Name"] = nodeunit.testCase({
  "Invoke a Function with No Args": function (test) {
    function testFunction() {
      test.done();
    }

    byname.invoke(testFunction);
  },

  "Good Direct Invoke": function (test) {
    function testFunction(arg1, arg2) {
      test.equal(arg1, "hello");
      test.equal(arg2, "world");
      test.done();
    }

    byname.invoke(testFunction, {
      arg1: "hello",
      arg2: "world",
      bullshit: "value"
    });
  },

  "Bad Function on Direct Invoke": function (test) {
    test.throws(function () {
      byname.invoke(99, {
        arg1: "invalid"
      });
    }, Error, "targetFunction must be a function");
    test.done();
  },

  "Non Object on Direct Invoke": function (test) {
    function testFunction(arg1) {
      test.equal(arg1, 99);
      test.done();
    }

    byname.invoke(testFunction, 99);
  },

  "Wrapped Invoke": function (test) {
    function testFunction(arg1, arg2) {
      test.equal(arg1, "hello");
      test.equal(arg2, "world");
    }

    var wrapped = byname.wrap(testFunction);
    test.equal(typeof wrapped, 'function');
    
    wrapped({
      bullshit: "value",
      arg1: "hello",
      arg2: "world"
    });

    wrapped("hello", "world");

    test.done();
  },

  "Wrapped Invoke With Explicit Names": function (test) {
    function testFunction(a1, a2) {
      test.equal(a1, "hello");
      test.equal(a2, "world");
    }

    var wrapped = byname.wrap(testFunction, "arg1", "arg2");
    test.equal(typeof wrapped, 'function');

    var argumentNames = wrapped.getArgumentNames();
    test.ok(Array.isArray(argumentNames));
    test.equal(argumentNames.length, 2);
    test.equal(argumentNames[0], "arg1");
    test.equal(argumentNames[1], "arg2");

    wrapped({
      arg1: "hello",
      arg2: "world"
    });

    test.done();
  },

  "Cached Invoke": function (test) {
    function testFunction(arg1, arg2) {
      test.equal(arg1, "hello");
      test.equal(arg2, "world");
    }

    var wrapped = byname.wrap(testFunction);
    test.equal(typeof wrapped, 'function');

    wrapped({
      arg1: "hello",
      arg2: "world"
    });

    byname.invoke(testFunction, {
      arg1: "hello",
      arg2: "world"
    });

    test.done();
  },

  "Explicit Arguments Added": function (test) {
    function testFunction(arg1, arg2) {
      test.equal(arg1, "hello");
      test.equal(arg2, "world");
    }

    var wrapped = byname.wrap(testFunction);
    wrapped({ arg1: "x", arg2: "y" }, "hello", "world", "cruel as you are");
    wrapped({ arg1: "ignored", arg2: "ignored" }, "hello", "world");
    wrapped({ arg1: "hello", arg2: "ignored" }, "world");

    test.done();
  },

  "Proper Parsing of Signatures": function (test) {
    function testFunction(/* arg first */
                          arg1 /*yep*/   , /* arg sec */       arg2
                          /* comment after */) {
      test.equal(arg1, "hello");
      test.equal(arg2, "world");
      test.done();
    }

    var wrapped = byname.wrap(testFunction);
    test.equal(typeof wrapped, 'function');

    var argumentNames = wrapped.getArgumentNames();
    test.ok(Array.isArray(argumentNames));
    test.equal(argumentNames.length, 2);
    test.equal(argumentNames[0], "arg1");
    test.equal(argumentNames[1], "arg2");

    wrapped({
      arg1: "hello",
      arg2: "world"
    });
  },

  "Object-Generated Defaults": function (test) {
    function testFunction(arg1, arg2) {
      test.equal(arg1, "hello");
      test.equal(arg2, "world");
    }

    var wrapped = byname.wrap(testFunction);

    test.throws(function () {
      wrapped.withDefaults(99);
    }, Error, "defaults must be an object");

    var defaulted = wrapped.withDefaults({
      arg1: "hello",
      arg2: "world"
    });

    defaulted();
    defaulted({ });
    defaulted({ arg1: "hello" });
    defaulted({ arg2: "world" });
    defaulted("world");

    test.done();
  },

  "Function-Generated Defaults": function (test) {
    var arg1Result = "hello";
    var arg2Result = "world";

    function testFunction(arg1, arg2) {
      test.equal(arg1, arg1Result);
      test.equal(arg2, arg2Result);
    }

    function defaultGenerator() {
      return {
        arg1: arg1Result,
        arg2: arg2Result
      };
    }

    var defaulted = byname.wrap(testFunction).withDefaults(defaultGenerator);
    defaulted();
    arg2Result = "there";
    defaulted();
    test.done();
  },

  "Bad Function Generated Defaults": function (test) {
    /* istanbul ignore next */
    function testFunction(arg1, arg2) {
    }

    function defaultGenerator() {
      return 99;
    }

    var defaulted = byname.wrap(testFunction).withDefaults(defaultGenerator);
    test.throws(defaulted, Error, "default generator must return object");
    test.done();
  }
});
