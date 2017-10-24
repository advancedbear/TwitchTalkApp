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
    let row = '<tr id="'+key+'"><td>'+key+'</td><td>'+val+'</td><td><div class="button_wrapper"><button onclick="deleteRow(this)">✕</button></div></td></tr>';
    return row;
}

function deleteRow(obj){
    let delKey = $(obj).parent().parent().parent().attr("id");
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
    repList[word1] = word2;
    localStorage.replaceList = JSON.stringify(repList);
}