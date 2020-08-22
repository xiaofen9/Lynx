var kindOf = require('kind-of');
var path = require('path');
var utils = require("../TestcaseUtils.js");


var Lynx_input = {
  user: 'barney',
  age: 36,
  active: true,
};


function test(userJson){
       var Lynx_ret = kindOf(userJson);
    
}
utils.entry(test, Lynx_input);

