var gui = require('nw.gui');

var repList = {};


nw.Window.get().on('loaded', function(){
    if(location.pathname == '/view/replacement.html'){
        repList = JSON.parse(localStorage.replaceList);
        console.log(repList);
        for (key in repList) {
            $("#list").append(createRow(key, repList[key]));
        }
    } else if (location.pathname == '/view/JPsettings.html'){
        let bouyomi_s = JSON.parse(localStorage.bouyomiServer);
        $("#bouyomi_ip").val(bouyomi_s.host);
        $("#bouyomi_port").val(bouyomi_s.port);
    } else if (location.pathname == '/view/ENsettings.html'){
    } else if (location.pathname == '/view/help.html'){

    }
})

function createRow(key, val){
    key = escapeHTML(key);
    val = escapeHTML(val);
    let row = '<tr id="'+key+'"><td>'+key+'</td><td>'+val+'</td><td><div class="button_wrapper"><button onclick="deleteRow(this)">✕</button></div></td></tr>';
    return row;
}

function deleteRow(obj){
    let delKey = escapeJs(unEscapeHTML($(obj).parent().parent().parent().attr("id")));
    console.log(delKey);
    delete repList[delKey];
    $(obj).parent().parent().parent().remove();
    localStorage.replaceList = JSON.stringify(repList);
}

function addWord(){
    let word1 = $("#word1").val();
    let word2 = $("#word2").val();
    $("#word1").val("");
    $("#word2").val("");
    $("#list").append(createRow(word1, word2));
    repList[escapeJs(word1)] = escapeJs(word2);
    localStorage.replaceList = JSON.stringify(repList);
}

var escapeHTML = function (str) {
    return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
};

var unEscapeHTML = function (str) {
    return str
            .replace(/(&lt;)/g, '<')
            .replace(/(&gt;)/g, '>')
            .replace(/(&quot;)/g, '"')
            .replace(/(&#39;)/g, "'")
            .replace(/(&amp;)/g, '&');
};

var escapeJs = function (str) {
    return str
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\//g, '\\/')
            .replace(/</g, '\\x3c')
            .replace(/>/g, '\\x3e')
            .replace(/(0x0D)/g, '\r')
            .replace(/(0x0A)/g, '\n');
};

var unEscapeJs = function (str) {
    return str
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\//g, '/')
            .replace(/\\x3c/g, '<')
            .replace(/\\x3e/g, '>')
            .replace(/\\\\/g, '\\');
};