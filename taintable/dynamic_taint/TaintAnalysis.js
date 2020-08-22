J$.analysis = {};

(function(sandbox) {
    function TaintAnalysis() {
        var tynt = require('tynt');
        var attr_finder = require(__dirname + '/../utils/attrFinder.js');
        var af = new attr_finder();
        var fs = require("fs");

        // API provided by Jalangi
        var iidToLocation = sandbox.iidToLocation;
        var smemory = sandbox.smemory;

        // internal variables
        var taint_tag_to_input = {};
        var omap = new WeakMap();
        var tainted_var = {};  // tainted_var = { "tainted_property_in_user_input" : {"file_path": [variables]} }
        var currentFunc;
        var valueID = 0;
        var analysis_property = ['tainted', 'tainted_iiid'];
        var function_queue = {};
        var carrier_list = {};  // carrier_list = {"function_name": [carrier_0, carrier_1, ..., carrier_n]}
        var taint_state = true;
        var source_executed = false; // if source() has never been called, nothing will be tainted. In most cases,
        var anon_cnt = 0;

        // results
        var hidden_attr = {}; // hidden_attr = {"tainted_property_in_user_input" : { "hidden_param" : {"base": base_variable, "file_path": file_path} }}
        var sname = "";
        var carrier_cnt = 0;

	    function convertString(val){
	        return new String(val);
	    }

        function convertNumber(val){
            return new Number(val);
        }

        function countCarrier(){
            for(var i in carrier_list)
                carrier_cnt = carrier_cnt + carrier_list[i].length;
            //console.log("# of carrier: " + carrier_cnt);
        }

        // get function name of given location. For anonymous function, the name will be like anon_111
        function getFunc(line_start, col_start, line_end, col_end){
            for(i in function_queue){
                if((function_queue[i][0] == line_start && function_queue[i][1] <= col_start) || function_queue[i][0] < line_start){
                    if((function_queue[i][2] == line_end && function_queue[i][3] >= col_end) || function_queue[i][2] > line_end){
                        return i;
                    }
                }                       
            }

            return null;
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

                name = af.get_name_by_loc(loc, af);

                if(mode == 0)
                    return [loc['file_loc'], name];
                else if(mode == 1)
                    return loc['var_loc'];
            } else {
                return null;
            }
        }

        this.scriptEnter = function(iid, fileName) {
            // get the name of current script
            if(sname == ""){
                fnarray = fileName.split("/");
                sname = fnarray[fnarray.length - 1] + "on";
            }
        };

        this.invokeFun = function(iid, f, base, args, val, isConstructor) {
            // hook source to insert taint tag
            if (f.name === "source") {
		        if(typeof(val) == "string"){
		            val = convertString(val);
                } else if (typeof(val) == "number"){
                    val = convertNumber(val);
                } else if(val == null || val == undefined){
                    return val;
                }

                if(typeof(val) != "object")
                    return val;

                var source_id = ++valueID;
		        val.tainted = "source";
        		val.tainted_iiid = source_id;

                taint_tag_to_input[valueID] = {"name": args[1], "location": "undefined"};

                hidden_attr[args[1]] = {};
                tainted_var[args[1]] = [];

                taint_state = true;
                source_executed = true;

                countCarrier();
            }
            return val;
        };

        this.functionEnter = function(iid, f, dis, args){
            var vlocation = iidToLocation(iid);
            if(/.*:\d*:\d*:\d*:\d*/.test(vlocation)){
                var content = vlocation.slice(1,-1).split(":");
                var line_start = parseInt(content[1], 10);
                var col_start = parseInt(content[2], 10)-1;
                var line_end = parseInt(content[3], 10);
                var col_end = parseInt(content[4], 10)-1;

                if(f.name == ""){
                    fname = "anon_" + anon_cnt;
                    anon_cnt++;
                } else {
                    fname = f.name;
                }
                function_queue[fname] = [line_start,col_start,line_end,col_end];
            }
        }

        this.functionExit = function(iid, ret, wrappedExceptionVal){
            var vlocation = iidToLocation(iid);
            if(/.*:\d*:\d*:\d*:\d*/.test(vlocation)){
                var content = vlocation.slice(1,-1).split(":");
                var line_start = parseInt(content[1], 10);
                var col_start = parseInt(content[2], 10)-1;
                var line_end = parseInt(content[3], 10);
                var col_end = parseInt(content[4], 10)-1;

                var fname = getFunc(line_start, col_start, line_end, col_end);

                function_queue[fname] = [line_start,col_start,line_end,col_end];
                var i = -1;
                for(index in function_queue){
                    if(function_queue[index][0] == line_start 
                       && function_queue[index][1] == col_start
                       && function_queue[index][2] == line_end 
                       && function_queue[index][3] == col_end){
                        i = index;
                        break;
                    }
                }
                delete function_queue[fname];
            }
        }

        this.putField = function(iid, base, offset, val){
            // For a putField statement a[b] = c;
            // iid      ->      the putField statement.
            // base     ->      object a
            // offset   ->      the string "b"
            // val      ->      object c

            try{
                if(val && Object.prototype.hasOwnProperty.call(val,'tainted') && val.tainted == "source"){
                    taint_tag_to_input[val.tainted_iiid].location = iidToLocation(iid);
	    	    val.tainted = val.tainted_iiid;
                }
            } catch(e){
                // catch the error caused by getter/setter
            }
            return val;
        }

        this.getField = function(iid, base, offset, val) {
            // For a getField statement a[b] ;
            // iid      ->      the putField statement.
            // base     ->      object a
            // offset   ->      the string "b"
            // val      ->      object c

            if(taint_state && val ){//&& source_executed){
                name_data = get_loc_by_iid(iid);
                if(name_data == null)
                    return val;
                var file_path = name_data[0].toString();
                var variable_name = name_data[1].toString();

                if(typeof(val) == "object"){
               	    if(omap.get(base) == undefined){
                  	    omap.set(val, variable_name + "." + offset.toString());
                    } else {
       	                omap.set(val, omap.get(base).toString() + "." + offset.toString());
                    }
                }

                if(val && Object.prototype.hasOwnProperty.call(val, 'tainted') && val.tainted > 0 && analysis_property.indexOf(offset) == -1){
                    val.tainted_loc = variable_name;
                    if(name_data != null){
                        var input_name = taint_tag_to_input[val.tainted].name;
                        if(tainted_var[input_name][file_path] == undefined){
                            tainted_var[input_name][file_path] = [omap.get(val)];
                            var loc = get_loc_by_iid(iid, 1);
                            if(loc != null){
                                var func = getFunc(loc['start']['line'], loc['start']['column'], loc['end']['line'], loc['end']['column']);
                                if(carrier_list[func] == undefined)
                                    carrier_list[func] = [iid];
                                else if(carrier_list[func].indexOf(iid) == -1)
                                    carrier_list[func].push(iid);
                            }
                        }
                        else if(tainted_var[input_name][file_path].indexOf(omap.get(val)) == -1){
                            tainted_var[input_name][file_path].push(omap.get(val));
                            var loc = get_loc_by_iid(iid, 1);
                            if(loc != null){
                                var func = getFunc(loc['start']['line'], loc['start']['column'], loc['end']['line'], loc['end']['column']);
                                if(carrier_list[func] == undefined)
                                    carrier_list[func] = [iid];
                                else if(carrier_list[func].indexOf(iid) == -1)
                                    carrier_list[func].push(iid);
                            }
                        }
                    }
                }

		        if(Object.prototype.hasOwnProperty.call(base, 'tainted') && base.tainted > 0){
		            if(name_data != null){
                        var input_name = taint_tag_to_input[base.tainted].name;
                        if(tainted_var[input_name][file_path] == undefined){
                            tainted_var[input_name][file_path] = [variable_name];
                            var loc = get_loc_by_iid(iid, 1);
                            if(loc != null){
                                var func = getFunc(loc['start']['line'], loc['start']['column'], loc['end']['line'], loc['end']['column']);
                                if(carrier_list[func] == undefined)
                                    carrier_list[func] = [iid];
                                else if(carrier_list[func].indexOf(iid) == -1)
                                    carrier_list[func].push(iid);
                            }
                        }
                        else if(tainted_var[input_name][file_path].indexOf(variable_name) == -1){
                            tainted_var[input_name][file_path].push(variable_name);
                            var loc = get_loc_by_iid(iid, 1);
                            if(loc != null){
                                var func = getFunc(loc['start']['line'], loc['start']['column'], loc['end']['line'], loc['end']['column']);
                                if(carrier_list[func] == undefined)
                                    carrier_list[func] = [iid];
                                else if(carrier_list[func].indexOf(iid) == -1)
                                    carrier_list[func].push(iid);
                            }
                        }
        		    }
        		}
            }
            return val;
        }

        this.read = function(iid, name, val, isGlobal) {
            if(taint_state){
                if(val && Object.prototype.hasOwnProperty.call(val, 'tainted') && val.tainted == "source"){
                    taint_tag_to_input[val.tainted_iiid].location = iidToLocation(iid);
        		    val.tainted = val.tainted_iiid;
                }

                try{
	                if(val && Object.prototype.hasOwnProperty.call(val, 'tainted') && val.tainted > 0){
                        name_data = get_loc_by_iid(iid);
                        var file_path = name_data[0].toString();
                        var variable_name = name_data[1].toString();
                        if(name_data != null){
                            var input_name = taint_tag_to_input[val.tainted].name;
                            if(tainted_var[input_name][file_path] == undefined){
                                tainted_var[input_name][file_path] = [variable_name];
                                var loc = get_loc_by_iid(iid, 1);
                                if(loc != null){
                                    var func = getFunc(loc['start']['line'], loc['start']['column'], loc['end']['line'], loc['end']['column']);
                                    if(carrier_list[func] == undefined)
                                        carrier_list[func] = [iid];
                                    else if(carrier_list[func].indexOf(iid) == -1)
                                        carrier_list[func].push(iid);
                                }

                            }
                            else if(tainted_var[input_name][file_path].indexOf(variable_name) == -1){
                                tainted_var[input_name][file_path].push(variable_name);
                                var loc = get_loc_by_iid(iid, 1);
                                if(loc != null){
                                    var func = getFunc(loc['start']['line'], loc['start']['column'], loc['end']['line'], loc['end']['column']);
                                    if(carrier_list[func] == undefined)
                                        carrier_list[func] = [iid];
                                    else if(carrier_list[func].indexOf(iid) == -1)
                                        carrier_list[func].push(iid);
                                }

                            }
	                    }
                    }
                } catch (e){
                    // catch the error caused by getter/setter
                }

                return val;
            }
            return val;
        };

        this.write = function(iid, name, val, oldValue) {
            // For a write statement a = func(b);
            // iid      ->      func(b)
            // name     ->      string "a"
            // val      ->      the value of a after assignment
            // oldValuoe->      the value of a before assignment
            try{
                if(val && Object.prototype.hasOwnProperty.call(val, 'tainted') && val.tainted == "source"){
                    taint_tag_to_input[val.tainted_iiid].location = iidToLocation(iid);
                    val.tainted = val.tainted_iiid;
                }
            } catch (e){
                // catch the error caused by getter/setter
            }

            return val;
        };

        function get_hidden_attr(tainted_dict){
            //tainted_dict =  {"param": {file_path: [tainted_varibles], file_path2: [tainted_variable2]}}
            for(var param in tainted_dict){
                for(var file in tainted_dict[param]){
                    try{
                        hidden_list = af.analyze_hidden_attr(file, tainted_dict[param][file], af);
                    }catch(e){
                        console.log(tynt.Red("[Error]@TaintAnalysis - get_hidden_httr. " + e));
                        console.log(tynt.Red("[Error]params: file: " + file + ", param: " + JSON.stringify(tainted_dict[param][file])));
                    }
                    for(var key in hidden_list){
                        for(var hidden_index in hidden_list[key]){
                            obj_index = hidden_list[key][hidden_index].indexOf(key);
                            dot_index = hidden_list[key][hidden_index].substring(obj_index+key.length+1).indexOf(".");
                            hidden_param = hidden_list[key][hidden_index].substring(obj_index+key.length+1);
                            base_param = "";

                            if(key.indexOf(".") == -1){
                                base_param = key;
                            } else {
                                key_arr = key.split(".");
                                base_param = key_arr[key_arr.length - 1];
                            }

                            hidden_attr[param][hidden_param] = {"base": base_param, "file": file, "domain": key};
                        }
                    }
                }
            }
        }

        this.endExecution = function(){
            if(!source_executed){
                console.log(tynt.Red("[Error]@TaintAnalysis - endExecution. source function has never been called."));
                return;
            }

            countCarrier();
            console.log(carrier_list);

            get_hidden_attr(tainted_var);
            //console.log(JSON.stringify(tainted_var));

            console.log(hidden_attr);
            fs.writeFileSync(__dirname + "/../../outputs/hidden_attr/" + sname, JSON.stringify(hidden_attr));
        }
    }

    sandbox.analysis = new TaintAnalysis();
})(J$);
