var menu = new nw.Menu({ type: 'menubar' });
var submenu = new nw.Menu();
submenu.append(new nw.MenuItem({ label: 'Replacement', click: function(){replaceSettings();} }));
submenu.append(new nw.MenuItem({ label: 'JP Voice', click: function(){JPSettings();} }));
submenu.append(new nw.MenuItem({ label: 'EN Voice', click: function(){ENSettings();} }));
menu.append(new nw.MenuItem({ label: 'Settings', submenu: submenu}));
menu.append(new nw.MenuItem({ type: 'separator' }));
menu.append(new nw.MenuItem({ label: 'Help', click: function(){showHelp();} }));
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

function showHelp(){
    gui.Window.open ('view/help.html', {
        width: 640,
        height: 480,
        resizable: false
      }, function(tmi){
        tmi.on ('loaded', function(){
            console.log("loaded!");
        });
    });
}