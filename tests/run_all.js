var fs = require('fs');
var path = require('path');
const configs = require(path.resolve(__dirname, "configs.json"));
var execSync = require('child_process').execSync;

const TYPE = 0; // 0: analysis, 1: verify

// run each case by chaning config.json file itself
for (var i = 10; i < configs.length; i++) {
    run_conf(i);
}

// restore all false config at the end
fs.writeFileSync('configs.json', JSON.stringify(configs));

function run_conf(id){
    console.log("[+] Running "+ configs[id].testName);
    var cur =  JSON.parse(JSON.stringify(configs));
    cur[id].enable = true;
    // write confs to file
    fs.writeFileSync('configs.json', JSON.stringify(cur));
    // call analysis/verify
    var cmd = "node "
    if (TYPE == 0){
        cmd += "Analysis.js";
    }else{
        cmd += "Verify.js";
    }

    try{
        execSync(cmd);
    }catch(error){
        console.log("[x] Runall Error "+ cur[id].testName);
    }
}
