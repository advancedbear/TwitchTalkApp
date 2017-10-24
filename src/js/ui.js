var menu = new nw.Menu({ type: 'menubar' });
var submenu = new nw.Menu();
submenu.append(new nw.MenuItem({ label: 'Replacement', click: function(){replaceSettings();} }));
submenu.append(new nw.MenuItem({ label: 'JP Voice', click: function(){JPSettings();} }));
submenu.append(new nw.MenuItem({ label: 'EN Voice', click: function(){ENSettings();} }));
var readName = new nw.MenuItem({ type: 'checkbox', label: 'Read Name', click: function(){chkReadName();}});
submenu.append(readName);
if(localStorage.readName) readName.checked = localStorage.readName;
submenu.append(new nw.MenuItem({ type: 'separator' }));
submenu.append(new nw.MenuItem({ label: 'Reset Settings', click: function(){resetSettings();} }));
var submenu2 = new nw.Menu();
submenu2.append(new nw.MenuItem({ label: 'Help(JP)', click: function(){showHelp("jp");}}));
submenu2.append(new nw.MenuItem({ label: 'Help(EN)', click: function(){showHelp("en");}}));
menu.append(new nw.MenuItem({ label: 'Settings', submenu: submenu}));
menu.append(new nw.MenuItem({ type: 'separator' }));
menu.append(new nw.MenuItem({ label: 'Help', submenu: submenu2}));
mainWindow.menu = menu;

function replaceSettings(){
    gui.Window.open ('view/replacement.html', {
        width: 640,
        height: 480,
        resizable: false
      }, function(tmi){
        tmi.on ('loaded', function(){
            console.log("loaded!");
        });
        tmi.on ('closed', function(){

        })
    });
}

function JPSettings(){
    gui.Window.open ('view/JPsettings.html', {
        width: 240,
        height: 160,
        resizable: false
      }, function(tmi){
        tmi.on ('loaded', function(){
            console.log("loaded!"); 
        });
        let tmiPage = tmi.window.document;
        $(tmiPage).on('click', '#bouyomi_submit', function(){
            bouyomiServer.port = tmiPage.getElementById("bouyomi_port").value;
            bouyomiServer.host = tmiPage.getElementById("bouyomi_ip").value;
            tmi.close();
            localStorage.bouyomiServer = JSON.stringify(bouyomiServer);
        })
    });
}

function ENSettings(){
    gui.Window.open ('view/ENsettings.html', {
        width: 240,
        height: 160,
        resizable: false
      }, function(tmi){
        tmi.on ('loaded', function(){
            console.log("loaded!");
        });
    });
}

function showHelp(lang){
    let url='view/help_'+lang+'.html';
    gui.Window.open (url, {
        width: 640,
        height: 480,
        resizable: false
      }, function(tmi){
        tmi.on ('loaded', function(){
            console.log("loaded!");
        });
    });
}

function chkReadName(){
    let check = readName.checked;
    localStorage.readName = check;
}

function resetSettings(){
    if(window.confirm('Are you sure?\n設定が全て消去されます、よろしいですか？')){
        localStorage.clear();
        alert("All settings are cleared.\nすべての設定が消去されました。");
        mainWindow.reload();
    } else {

    }
}