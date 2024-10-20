var express = require('express');
var cookieParser = require('cookie-parser');

var app = express();

app.use(cookieParser('Secret string'));

app.get('/', function(req, res){
    // Установка куков
    res.cookie('login', 'admin', { maxAge : 12000 });
    res.cookie('login2', 'user', { maxAge : 12000});
    
    
    console.log(req.cookies['login']);
    console.log(req.cookies['login2']);

    // Удаление куков
   // res.clearCookie('login');

    res.end();
});

app.listen(8080);

// Documentation - https://www.npmjs.com/package/cookie-parser