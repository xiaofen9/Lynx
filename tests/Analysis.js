var fs = require('fs');
var path = require('path');
var utils = require(path.resolve(__dirname, "Utils"));
var configs = require(path.resolve(__dirname, "configs.json"))


var cacheRoot = path.resolve(__dirname,'../outputs/target_cache/');
if(!fs.existsSync(cacheRoot))
    fs.mkdirSync(cacheRoot);

//generate tasks with absolute path
var tasks = [];
var useCache = true;

for (var i = 0; i < configs.length; i++) {
    configs[i].projPath = path.resolve(__dirname, configs[i].projPath)
    if (configs[i].enable)
        tasks.push(configs[i]);
}



function run(task) {
    if (!task) return;
    console.log("Running " + task.projPath);

    // check the useCache variable to dicide whether we use cache

    var projectCache = path.resolve(cacheRoot, task.projPath.split('/target/')[1])
    var completed = path.resolve(projectCache, "complete_instrumented");
    if(!useCache && fs.existsSync(completed))
        fs.rmdirSync(completed);
    var targetPath = utils.instrumentSync(task.projPath, task.instrFiles, task.testName);
    process.chdir(projectCache);

    var testName = task.testName;
    console.log(targetPath, testName, task)


    // Analysis testcases with Jalangi
    if(task.args)
        utils.runAnalysis(task.startFile, targetPath,task.args);
    else
        utils.runAnalysis(task.startFile, targetPath);

    console.log("Finished executing " + task.startFile);

    if (tasks.length > 0) {
        run(tasks.shift());
    } 
}


// entry point
run(tasks.shift());
