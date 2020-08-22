# Lynx

Lynx is a vulnerabiltiy analysis tool to detect hidden property abusing ([HPA](https://www.blackhat.com/us-20/briefings/schedule/index.html#discovering-hidden-properties-to-attack-the-nodejs-ecosystem-19594)) vulnerability in the Node.js ecosystem.


## Tutorial

### Environmental Requirement
We are using the following Node environment. Other versions of Node.js are not fully tested but probably also work.
- Node 8.10.0 
- npm 5.6.0
 
To use the Exploit module, you also need to install ExpoSE by running `npm install` in `exploitable/ExpoSE`.
 
### Harness Preparation
Lynx takes concrete testcases as input. The following sections introduce how to prepare the test harness required by Lynx.

A template of the harness is shown below.

```
var utils = require("../TestcaseUtils.js");
var Lynx_input = init_input();

function test(param){
   var Lynx_ret = module_func1(param);
   Lynx_ret = module_func2(param);
}

utils.entry(test, Lynx_input);
```

There are only 2 must-have elements for a testcase: 
- The name of the tested variable has to be `Lynx_input`.
- An analysis utils module named `TestcaseUtils` should be imported. The tested API and tested `Lynx_input` should be passed to the `utils.entry` function as two arguments (as indicated by the last line in the above test case). 

Optionally, if you want to monitor the changes on module invocation return, you should assign the return value to a variable named `Lynx_ret` (as indicated by the `test()` function in the above test case).

After preparing such a testcase, you need to add configurations for your new test case into `configs.json` in the following format. `../TestcaseUtils.js` has to be included in `instrFiles`. All the other options can be customized according to the context of your test case (both relative path and absolute path are supported).

```
    {
        "testName": "TestKindof",
        "projPath": "./target/TestKindof",
        "startFile": "./TestKindof.js",
        "instrFiles": ["./TestKindof.js", "../TestcaseUtils.js"],
        "enable": true
    }
```

### Using Lynx

#### Detecting Hidden Property

1. To identify hidden properties in a given module, users first change the `enable` option of the corresponding target module config to `true`.
2. Enter the dictionary `Lynx/tests` and execute `node Analysis.js`
3. Rock & roll.


#### Exploiting Hidden Property
Now you got a list of potential hidden properties, and you may want to know more about them: (1) Are these properties controllable? and how to construct the associated input? (2) Are these properties security-sensitive or exploitable?  This section tells you how Lynx can faciliate concrete exploit generation and vulnerability detection.

Following the steps below:
1. make sure that the `enable` option of the corresponding target module is `true` in `configs.json`.
2. If you haven't executed `node Analysis.js` for the target module, do it first.
3. Enter the dictionary `Lynx/tests` and execute `node Exploit.js`
4. Rock & roll.


### Trouble Shooting
Lynx can work farely well in most cases. However, it may experience incompatible problems when trying to analyzing modules using a lot of new JS grammer features.
This is because our underlying instrumentation framework (i.e., Jalangi) supports ECMAScript 5 only. Usually, such incompability issues can be resolved by down-compiling incompetible programs with Babel, which is a JavaScript compiler. To smooth the process of program de-compiling, we prepared a docker which can automatically transform Node.js modules to Jalangi compatible code.


#### Down-compiling the tested program with babel
we prepared a docker image, you can use command `docker pull ex1tt/babel7_for_jalangi` to pull the docker image from dockerhub or build this docker by yourself. After the docker is ready to use, change your current directory to the test case path, then use node `../../../babel_current_dir.sh` to transform the codes. If you get some errors in transforming the codes and you may want to ignore them and try to re-run the analysis directly. Or you can use `node ../../../babel_ignore_error_file.js` to proceed a partial transformation.


#### Removing the error-throwing modules from the analysis scope of Lynx
Jalangi by default instruments all the files/module dependencies within the tested programs. However, there are usually a large number of files will be remain uncalled when the program is being tested, and these unused files may also interupt the analysis process. As a result, if the babel down-compiling does not work, you may want to let Lynx ignore those modules by moving those error-throwing modules from `Lynx/tests/target/Testxxx/node_modules` to `Lynx/node_modules`. We did encounter some cases (e.g., some large web apps) in which we have to move some files before Jalangi is willing to analyze it. 

## Acknowledgement
Thanks for the following projects for providing valuable resources that faciliate our project.
- Instrumentation Framework: [Jalangi](https://jacksongl.github.io/files/demo/jalangiff/demo_integrated.htm#)
- Symbolic Executor: [ExpoSEJS](https://github.com/ExpoSEJS/ExpoSE)
- Syntactic Analysis: [Esprima](https://esprima.org/)
- Pipeline Configuration: [IFLOW](https://new-iflow.herokuapp.com/download-iflow.html)
