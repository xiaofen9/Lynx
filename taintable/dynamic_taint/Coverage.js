J$.analysis = {};

(function(sandbox) {
    function Coverage() {
        var tynt = require('tynt');
        var fs = require("fs");

        // API provided by Jalangi
        var iidToLocation = sandbox.iidToLocation;
        var smemory = sandbox.smemory;

        // internal states
        var sname = "";

        // Save touched iid
        var touched_list = {};
        
        this.touch = function(iid){
            var loc = get_loc_by_iid(iid);

            if(loc == null)
                return;

            if(touched_list[loc['file_loc']] == undefined)
                touched_list[loc['file_loc']] = [];

            if(touched_list[loc['file_loc']].indexOf(loc['var_loc']['start']['line']) == -1)
                touched_list[loc['file_loc']].push(loc['var_loc']['start']['line']);
        }

        // return location of given iid
        // input: iid of (function, variable ...)
        // output: [file_path, the name of something]
        function get_loc_by_iid(iid, mode=0){
            var vlocation = iidToLocation(iid);

            // original location format: {file_path:start_line:start_column:end_line:end_column}
            // all the numbers start from 1 while not 0
            if(/.*:\d*:\d*:\d*:\d*/.test(vlocation)){
                var content = vlocation.slice(1,-1).split(":");
                var loc = {};

                loc['file_loc'] = content[0];
                loc['var_loc'] = {};
                loc['var_loc']['start'] = {};
                loc['var_loc']['end'] = {};
                loc['var_loc']['start']['line'] = parseInt(content[1], 10);

                loc['var_loc']['start']['column'] = parseInt(content[2], 10) - 1;
                loc['var_loc']['end']['line'] = parseInt(content[3], 10);
                loc['var_loc']['end']['column'] = parseInt(content[4], 10) - 1;
                // console.log(JSON.stringify(loc));

                return loc;
            } else {
                return null;
            }
        }

        this.scriptEnter = function(iid, fileName) {
            // get the name of current script
            //if(sname == ""){
            //    fnarray = fileName.split("/");
            //    sname = fnarray[fnarray.length - 1] + "on";
            //}
        };

        this.invokeFunPre = function(iid, f, base, args, isConstructor){
            this.touch(iid);
        }

        this.putField = function(iid, base, offset, val){
            // For a putField statement a[b] = c;
            // iid      ->      the putField statement.
            // base     ->      object a
            // offset   ->      the string "b"
            // val      ->      object c

            this.touch(iid);
            return val;
        }

        this.getField = function(iid, base, offset, val) {
            // For a getField statement a[b] ;
            // iid      ->      the putField statement.
            // base     ->      object a
            // offset   ->      the string "b"
            // val      ->      object c

            this.touch(iid);
            return val;
        }

        this.read = function(iid, name, val, isGlobal) {
            this.touch(iid);
            return val;
        };

        this.write = function(iid, name, val, oldValue) {
            // For a write statement a = func(b);
            // iid      ->      func(b)
            // name     ->      string "a"
            // val      ->      the value of a after assignment
            // oldValuoe->      the value of a before assignment
            this.touch(iid);
            return val;
        };

        this.literal = function(iid, val){
            this.touch(iid);
            return val;
        }

        this.binary = function(iid, op, left, right, result_c){
            this.touch(iid);
            return result_c;
        }

        function calcCoverage(){
            var cov = {};
            var count_lines = 0;
            var count_touched = 0;
            for(var file in touched_list){
                var data = fs.readFileSync(file, 'utf8');
                var total_line = data.trim().split("\n").length;
                var touched_line = touched_list[file].length;
                var file_coverage = touched_line / total_line;

                cov[file] = {"total": total_line, "touched": touched_line, "coverage": file_coverage};
                count_lines = count_lines + total_line;
                count_touched = count_touched + touched_line;
                //console.log("File: " + file);
                //console.log("total lines: " + total_line + ", touched lines: " + touched_line + ", coverage: " + file_coverage);
            }
            
            console.log("Total: ");
            console.log("total lines: " + count_lines + ", touched lines: " + count_touched + ", coverage: " + count_touched*1.0/count_lines);

            return cov;
        }

        this.endExecution = function(){
            var coverage = calcCoverage();
            //console.log(JSON.stringify(coverage));
        }
    }

    sandbox.analysis = new Coverage();
})(J$);
