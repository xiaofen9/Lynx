"use strict";

var esprima = require('esprima');
var fs = require('fs');
var tynt = require('tynt');
const NodeCache = require( "node-cache");



module.exports = class attrFinder{
    constructor(){
        this.Cache = new NodeCache();
        this.analyze_hidden_attr = f_a;
        this.get_name_by_loc = f_g;
        this.get_type_by_loc = f_t;
    }
}

var f_a =  function analyze_hidden_attr(file_loc, domain, finder){
    var file_loc, domain, content;
    var cmd = {'mode':'getAll', 'res' : [], "loc":file_loc};
    var cache = finder.Cache.get(file_loc);
    // cache analyzed file to speed up further re-analyze
    if (cache == undefined){
        content = fs.readFileSync(file_loc, 'utf-8');
        finder.Cache.set(file_loc, content);
    }else{
        content = cache;
    }
    search_all_attr(file_loc, content, cmd);
    var taint_lst = cal_taintable_attr(domain, cmd.res);
    return taint_lst;
}

var f_g = function get_name_by_loc(loc, finder){
    var content;
    var cmd = {'mode':'findOne', 'loc':loc.var_loc, 'res':[]};
    var cache = finder.Cache.get(loc.file_loc);
    if (cache == undefined){
        content = fs.readFileSync(loc.file_loc, 'utf-8');
        finder.Cache.set(loc.file_loc, content);
    }else{
        content = cache;
    }
    search_all_attr(loc.file_loc, content, cmd);
    if (cmd.res.length ===  0){
        //console.log(tynt.Red("[x] get_name_by_loc error: " + JSON.stringify(loc)+ ' not found'));
        return -1;
    }
    return cmd.res[0];
}

// return 0 -> plain var
// return 1 -> func
var f_t = function get_type_by_loc(loc){
    var content;
    var cmd = {'mode':'findType', 'loc':loc.var_loc, 'res':[]};
    content = fs.readFileSync(loc.file_loc, 'utf-8');
    search_all_attr(loc.file_loc, content, cmd);
    if (cmd.res.length ===  0){
        return 0;
    }
    return 1;
   
}


//calculate taintable attributes according to dynamic taint result
function cal_taintable_attr(domain, attr_lst){
    var taint_lst = {};
    for (const attr of attr_lst){
        for (const d of domain){
            if (attr == d) continue;
            if (attr.startsWith(d + '.')){
                if (!(d in taint_lst)) taint_lst[d] = [];
                if (taint_lst[d].indexOf(attr) === -1) taint_lst[d].push(attr);
            }
        }
    }

    return taint_lst;
}


function search_all_attr(file_loc, text, cmd) {
    var ast;
    try {
        var ast = esprima.parse(text, {comment:true, tokens:true, loc:true});
    } catch (e) {
        console.log(tynt.Red("\n[x] search_all_attr : Error when parsing "+ file_loc +", Will ignore this file.\n" + e));
        return;
    }
    if (cmd.relaxed) {
        relaxed_traverse(ast['body'], [], propertyVisitor, cmd);
    }else{
        traverse(ast['body'], [], propertyVisitor, cmd);
    }
    return;
}


// Executes visitor on the ast tree and its children (recursively).
function traverse(object, domain, Visitor, cmd) {
    var key, child;

    if (Visitor.call(null, object, domain, cmd) === false) {
        return;
    }
    //console.log(object);
    // add new scope to the domain  when enter a new function
    if (object.type === 'FunctionDeclaration'){
        domain = [...domain]
        domain.push(object.id.name);
    } else if (object.type === 'FunctionExpression'){
        domain = [...domain];
        var anonymous_func;
        if (object.id === null){
            anonymous_func = 'anon_'+ object.loc.start.line+'_'+object.loc.start.column+'_'+object.loc.end.line+'_'+object.loc.end.column;
        }else{
            anonymous_func = object.id.name;
        }
        domain.push(anonymous_func);
    }
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, domain, Visitor, cmd);
            }
        }
    }
}


// Executes visitor on the ast tree and its children in relatexed_mode.
function relaxed_traverse(object, domain, Visitor, cmd) {
    var key, child;

    if (Visitor.call(null, object, domain, cmd) === false) {
        return;
    }

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                relaxed_traverse(child, domain, Visitor, cmd);
            }
        }
    }
}





// recursively visit a property 
function propertyVisitor(node, domain, cmd){
    var node, domain;

    if (node.type === "MemberExpression" || node.type === "Identifier"){
        if (cmd.mode === "findOne"){
            // for the purpose of get_name_by_loc, we just get name for base and standalone var (a in a[b] or b)
            if (scope_match_base(node.loc, cmd.loc)){
                read_standalone_or_base(node, [...domain], cmd);
                return false; // stop visiting the child 
            }else {
                return true; // continue visiting the child 
            }
        } else if (cmd.mode === "getAll"){
	    // read all properties under the domain
            read_property(node, [...domain], domain.length, cmd);
            return false;
        }
    }

    if (node.hasOwnProperty("type") || Array.isArray(node)) {
        if (cmd.mode === "findType" && node.type === "CallExpression"){
            if (node.callee.property && JSON.stringify(node.callee.property.loc) === JSON.stringify(cmd.loc)){
                cmd.res.push(1);
                return false; // stop visiting
            }
        }
        return true; // continue visiting
    }
    return false;
}


//return true if the target_loc is  the cur_loc 
function scope_match_entire_node(cur_loc, target_loc){
    if (  cur_loc.start.line == target_loc.start.line &&
          cur_loc.start.column <= target_loc.start.column &&
          cur_loc.end.line >= target_loc.end.line &&
          cur_loc.end.column >= target_loc.end.column){
        return true;
    }
    return false;
}


// return true if the target_loc and cur_loc shares the same start,
// and target_loc can be shorter than cur_log, i.e., [) 
function scope_match_base(cur_loc, target_loc){
    if (  cur_loc.start.line == target_loc.start.line &&
          cur_loc.start.column == target_loc.start.column &&
          cur_loc.end.line >= target_loc.end.line &&
          cur_loc.end.column >= target_loc.end.column){
        return true;
    }
    return false;
}


// get the name of the a variable (base or standalone)
function read_standalone_or_base(node, path, cmd){
    // find the exact match of the loc 
    if (node.hasOwnProperty("property")){
        // this is a member expr 

        // find "a" in a.b.c.d.e.f 
        while (node.object.type === "MemberExpression") node = node.object;

        if (node.object.type === "Identifier"){
            path.push( node.object.name );
        } else if (node.object.type === "ThisExpression"){
            path.push("this");
        } else {
            if (node.object.type === "CallExpression") {
                cmd.res.push(-1);
                return;
            }
            if (node.object.type === "Literal") {
                cmd.res.push(-1);
                return;
            }
            if (node.object.type === "NewExpression") {
                cmd.res.push(-1);
                return;
            }
            if (node.object.type === "ArrayExpression") {
                cmd.res.push(-1);
                return;
            }
            if (node.object.type === "AssignmentExpression"){
                cmd.res.push(-1);
                return;
            }
            if (node.object.type === "ConditionalExpression"){
                cmd.res.push(-1);
                return;
            }
            console.log(tynt.Red("[x] read_standalone_or_base error: unknown object type " + JSON.stringify(node.object.type)));
            return;
        }

        // return results here 
        cmd.res.push(path.join("."));
        return;

    }else{
        // this is a standalone var
        if (JSON.stringify(node.loc) === JSON.stringify(cmd.loc)){
            path.push(node.name)
            cmd.res.push(path.join(".")); 
            return;
        }else{
            console.log(tynt.Red("[x] read_standalone_or_base error: not a standalone object iid " + JSON.stringify(node)));
        }
    }

}


// get a specifcy property referrenced in the file
function read_property(node, path, offset, cmd){
    
    // it is a member expr
    if (node.hasOwnProperty('property')) {
          
	//[1] handle object property first
        if (node.property.type === "Literal"){
            // it is a array indexing expr (a['c'])
            path.splice(offset, 0, node.property.value);
        }else if (node.property.type === "Identifier" && !node.computed){
            // it is a attribute indexing expr (a.c)
            path.splice(offset, 0, node.property.name);
        }else if (node.property.type === "MemberExpression"){
            // it is a nested indexing expr (a[b[c]]),we just igore "a" and read b[c]
            read_property(node.property, path, offset, cmd);
            return; 
        }else if (node.property.type != "Literal" && node.computed){
            // for query[key], we only record "query"
            // so we pop anything after key
            while (path.length > offset) path.pop();
        }else {
            console.log(tynt.Red("[x] read_property error: unknown attribute indexing type " + JSON.stringify(node.property.type)));
            console.log(cmd.loc);
            return;
        }



        //[2] handle object base then
        if ( node.object.type === "Identifier" ){
            // this is the end
            path.splice(offset, 0, node.object.name);
            var path_to_store = path.join('.');
            if (cmd.res.indexOf(path_to_store) === -1 ){
                cmd.res.push(path_to_store);
            }
        } else if (node.object.type === "MemberExpression"){
            // the object attr is still a nested member expr 
            read_property(node.object, path, offset, cmd);
        } else if (node.object.type === "ThisExpression" ){
            // the object attr is 'this' keyword 
            path.splice(offset, 0, "this");
            var path_to_store = path.join('.');
            if (cmd.res.indexOf(path_to_store) === -1 ){
                cmd.res.push(path_to_store);
            }
        } else {
            // now we start to handle special cases

            // this is statement like func('aaa').b. we only parse func("aaa");
            if ( node.object.type === "CallExpression" ) {
                if (node.object.callee.type === "MemberExpression"){
                    read_property(node.object.callee, path.splice(0,offset), offset, cmd);
                }
                return;
            }
            // this is statement like "i love".concat("lynx"), just ignore
            if ( node.object.type === "Literal" ) return;

            // this is statement like new String(aaa),we want to get aaa 
            if (node.object.type === "NewExpression") {
                const args = node.object.arguments;
                for (const id in args) read_property(args[id], path.splice(0,offset), offset, cmd);
                return;           
            }

            // this is statement like (a?b:c).aaa, we want a, b, c
            if (node.object.type === "ConditionalExpression"){
                const args = node.object;
                for (const id in args) read_property(args[id], path.splice(0,offset), offset, cmd);
                return;
            }

            // this is statement like (a||b).aaa, we want a, b
            if (node.object.type === "LogicalExpression"){
                var args = node.object;
                // read right 
                while (args.left.type === "LogicalExpression") {
                    read_property(args.right, path.splice(0,offset), offset, cmd);
                    args = args.left;
                }
                read_property(args.right, path.splice(0,offset), offset, cmd);
                // read left 
                read_property(args.left, path.splice(0,offset), offset, cmd);
                return;
            }


            // this is statement like (a + b + c).aaa, we want a, b, c
            if (node.object.type === "BinaryExpression"){
                var args = node.object;
                // read right 
                while (args.left.type === "BinaryExpression") {
                    read_property(args.right, path.splice(0,offset), offset, cmd);
                    args = args.left;
                }
                read_property(args.right, path.splice(0,offset), offset, cmd);
                // read left 
                read_property(args.left, path.splice(0,offset), offset, cmd);
                return;
            }

            // this is statement like [a,b].concat(), we want a,b
            if (node.object.type === "ArrayExpression"){
                const args = node.object.elements; 
                for (const id in args) read_property(args[id], path.splice(0,offset), offset, cmd);
                return;
            }

            console.log("[x] read_property error: unknown object tpye " + JSON.stringify(node.object));
            console.log(cmd.loc);
            return;
        }

    } else{
        // it is a standalone variable
        path.splice(offset, 0, node.name);
        var path_to_store = path.join('.');
        if (cmd.res.indexOf(path_to_store) === -1 ){
            cmd.res.push(path_to_store);
        }
    }
}

