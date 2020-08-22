var execSync = require('child_process').execSync;
var testcmd = "docker run --rm -v `pwd`:/target  -i ex1tt/babel7_for_jalangi babel /target --out-dir ~ --copy-files "
var error_files = []
var ignore_param = function (error_files) {
    return '--ignore "' + error_files.join('","') + '"';
}
while (true) {
    try {
        var cmd = testcmd +  ignore_param(error_files);
        console.log(cmd);
        execSync(cmd);
        break;
    } catch(e){
        var e_file = "/target"+ e.stderr.toString().split(':')[1].split('/target')[1]
        if (e_file.endsWith('js')) console.log('[+]e_file hit');
        else console.log("[!]didn't hit js file") 
        console.log(e_file)
        error_files.push(e_file);
    }
}



