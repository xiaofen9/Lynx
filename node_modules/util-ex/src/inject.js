var isArguments = require('./is/type/arguments');
var arraySlice = Array.prototype.slice;

    /*
    @desc  inject the function
    @param aOrgFunc     the original function to be injected.
    @param aBeforeExec  this is called before the execution of the aOrgFunc.
                        you must return the arguments(new Arguments(arguments))
                        if you wanna modify the arguments value of the aOrgFunc.
                        it will stop the execution of the aOrgFunc if you return
                        a value not an Arguments object nor a undefined value
    @param aAtferExec   this is called after the execution of the aOrgFunc.
                        you must add a result argument at the last argument of the
                        aAtferExec function if you wanna get the result value of the aOrgFunc.
                        you must add a isDenied argument following the result argument if you
                        wanna know whether the aOrgFunc is executed.
                        you must return the result if you wanna modify the result value of the aOrgFunc .

    @Usage  Obj.prototype.Method = inject(Obj.prototype.Method, aFunctionBeforeExec[, aFunctionAtferExec]);
    @version 1.1
    @author  Aimingoo&Riceball
    @history
      V1.0 -- first released.
      V1.1 --
        Supports to denie the aOrgFunc execution in aBeforeExec.
        Supports around in the aAtferExec, the aAtferExec be always executed even though
        denie the aOrgFunc execution in aBeforeExec.
          + isDenied argument to the aAtferExec function. notice the aAtferExec whether
            the aOrgFunc is executed

    eg:
    var doTest = function (a) {return a};
    function beforeTest(a) {
      alert('before exec: a='+a);
      a += 3;
      return arguments;
    };
    function afterTest(a, result, isDenied) {
      alert('after exec: a='+a+';result='+result+';isDenied='+isDenied);
      return result+5;
    };

    doTest = inject(doTest, beforeTest, afterTest);

    alert (doTest(2));
    the result should be 10.

  */
module.exports = function ( aOrgFunc, aBeforeExec, aAtferExec ) {
  return function() {
    var Result, isDenied=false, args=arraySlice.call(arguments);
    if (typeof(aBeforeExec) === 'function') {
      //the result
      //  * a return value instead of original function.
      //  * an arguments pass to original function.
      //  * whether deny the original function.
      //    * return the arguments to allow execution
      //    * return undefined to allow execution
      Result = aBeforeExec.apply(this, args);
      if (isArguments(Result)) {
        args = arraySlice.call(Result)
      }
      else if (isDenied = Result !== undefined)
        args.push(Result)
    }

    !isDenied && args.push(aOrgFunc.apply(this, args)); //if (!isDenied) args.push(aOrgFunc.apply(this, args));

    if (typeof(aAtferExec) === 'function') {
      Result = aAtferExec.apply(this, args.concat(isDenied));
    }
    else
      Result = undefined;

    return (Result !== undefined ? Result : args.pop());
  }
}
