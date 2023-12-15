"use strict";

var slice = Array.prototype.slice;

var functionSignatureRegex = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var argumentNamesSplitRegex = /\s*,\s*/m;
var commentRegex = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var argumentNameRegex = /^\s*(.+)\s*$/;

var noOptions = Object.freeze([{}]);
var argumentsCache = {};

function invoke(targetFunction) {
  return wrap(targetFunction).apply(null, slice.call(arguments, 1));
}

function wrap(targetFunction) {
  if ( !isFunction(targetFunction) ) {
    throw new Error("targetFunction (Function) required");
  }

  var argumentNames = getFunctionArguments.apply(null, arguments);
  var argumentNamesLength = argumentNames.length;

  invokeInterface.withDefaults = withDefaults;
  invokeInterface.getArgumentNames = getArgumentNames;
  return invokeInterface;

  function getArgumentNames() {
    return argumentNames.slice(0);
  }

  function withDefaults(defaults) {
    if ( isObject(defaults) ) {
      return withObjectDefaults(defaults);
    }
    else if ( isFunction(defaults) ) {
      return withFunctionDefaults(defaults);
    }
    throw new Error("defaults must be an Object or Function");
  }

  function withObjectDefaults(objectDefaults) {
    var defaultOptions = {};
    argumentNames.forEach(function (argumentName) {
      defaultOptions[argumentName] = objectDefaults[argumentName];
    });

    return generateDefaultedInvokeInterface(function () {
      return defaultOptions;
    });
  }

  function withFunctionDefaults(functionDefaults) {
    return generateDefaultedInvokeInterface(defaultsWrapper);

    function defaultsWrapper() {
      var result = functionDefaults();
      if ( !isObject(result) ) {
        throw new Error("Result of defaults Function should be an Object");
      }
      return result;
    }
  }

  function generateDefaultedInvokeInterface(generateDefaultOptions) {
    defaultedInvokeInterface.getArgumentNames = getArgumentNames;
    return defaultedInvokeInterface;

    function defaultedInvokeInterface() {
      var defaultedArguments = getDefaultedArguments(arguments);
      /* jshint validthis:true */
      return invokeInterface.apply(this, defaultedArguments);
    }

    function getDefaultedArguments(invokedArguments) {
      var defaultOptions = generateDefaultOptions();
      var defaultedArguments = slice.call(invokedArguments, 0);
      var options = defaultedArguments[0];
      if ( !isObject(options) ) {
        defaultedArguments.splice(0, 0, defaultOptions);
        return defaultedArguments;
      }
      defaultedArguments[0] = extend({}, defaultOptions, options);
      return defaultedArguments;
    }
  }

  function invokeInterface(options) {
    var invokeArguments = arguments;
    if ( !isObject(options) ) {
      invokeArguments = noOptions.concat(slice.call(arguments, 0));
    }

    var explicitArgumentsLength = invokeArguments.length - 1;
    if ( explicitArgumentsLength >= argumentNamesLength ) {
      /* jshint validthis:true */
      return targetFunction.apply(this, slice.call(invokeArguments, 1));
    }

    var startExplicitAt = argumentNamesLength - explicitArgumentsLength;
    var targetArguments = [];
    for ( var i = 0; i < startExplicitAt; i++ ) {
      targetArguments[i] = options[argumentNames[i]];
    }
    for ( ; i < argumentNamesLength; i++ ) {
      targetArguments[i] = invokeArguments[i - startExplicitAt + 1];
    }

    /* jshint validthis:true */
    return targetFunction.apply(this, targetArguments);
  }
}

function extend(targetObject) {
  var sourceObjects = slice.call(arguments, 1);
  sourceObjects.forEach(function (sourceObject) {
    var keys = Object.keys(sourceObject);
    keys.forEach(function (key) {
      targetObject[key] = sourceObject[key];
    });
  });
  return targetObject;
}

function isFunction(value) {
  return typeof value === 'function';
}

function isObject(value) {
  return typeof value === 'object' && value !== null;
}

function getFunctionArguments(targetFunction) {
  if ( arguments.length > 1 ) {
    return slice.call(arguments, 1);
  }

  var funcString = targetFunction.toString();
  var result = argumentsCache[funcString];
  if ( result ) {
    return result;
  }

  result = argumentsCache[funcString] = parseFunctionArguments(funcString);
  return result;
}

function parseFunctionArguments(functionString) {
  var strippedOfComments = functionString.replace(commentRegex, '');
  var functionRegexMatch = functionSignatureRegex.exec(strippedOfComments);
  var argumentsContent = functionRegexMatch[1];
  if ( !argumentsContent.length ) {
    return [];
  }

  var argumentNames = argumentsContent.split(argumentNamesSplitRegex);
  return argumentNames.map(function (argumentName) {
    return argumentNameRegex.exec(argumentName)[1];
  });
}

exports.invoke = invoke;
exports.wrap = wrap;
