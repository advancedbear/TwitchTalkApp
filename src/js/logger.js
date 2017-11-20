var fs = require('fs');
var path = require('path');
var flag;
var file;

exports.init = function(bool){
    flag = bool;
    let dt = new Date();
    file = path.join(path.dirname(process.execPath),"log_"+dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+dt.getDate()+"_"+dt.getHours()+"_"+dt.getMinutes()+"_"+dt.getSeconds()+".log");
    
    if(flag){
        fs.writeFile(file, "[LOGGING START]\r\n", function(err){
            console.log("LOG OUTPUT ERROR!!");
        })
    }
}

exports.out = function(text){
    if(flag){
        let dt = new Date();
        let header = "["+dt.getHours()+":"+dt.getMinutes()+":"+dt.getSeconds()+"]\t";
        fs.appendFile(file, header+text+"\r\n", function(err){
            console.log("LOG APPEND ERROR!!");
        })
    }
}