var express = require('express');
var app = express();

var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var mssql = require('mssql'); 

var jsonParser = bodyParser.json();
app.use(jsonParser);

var port = 8080;



// создание хранилища для сессий 
var sessionHandler = require('./js/session_handler');
var store = sessionHandler.createStore();
var config = sessionHandler.getConfig(); 



// создание сессии 
app.use(cookieParser());
app.use(session({
    saveUninitialized: true,
    secret: 'supersecret',
    resave: false
}));

// зарегистрированные пользователи, которые могут быть авторизованы
// var users = [
//     { username: 'admin', password: '12345' },
//     { username: 'foo', password: 'bar' },
//     { username: 'user', password: 'test' }
// ]
app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.post('/login',function (req, res) {

	console.log(req.body);

    let Login = req.body.Login;
    let Password = req.body.Password;
  
var connection = new mssql.ConnectionPool(config);



	connection.connect(config,function (err) {
        if (err) {
            console.log("Error connecting to db:", err);
        } else {
            console.log("Connecting to db Ok!");
        }
		// транзакция - безопасная операция над бд с возможностью отката изменений в случае ошибки при выполнении запроса  
		var transaction = new mssql.Transaction(connection);


		transaction.begin(function (err) {
			var request = new mssql.Request(transaction);
			request.input('Login', mssql.NVarChar(50), Login);
			request.input('Password', mssql.NVarChar(50), Password);


			request.query(`
                SELECT * 
                FROM Admins 
                WHERE Login = @Login AND Password = @Password
            `, function (err, data) {

				if (err) {
					console.log(err);
					transaction.rollback(function (err) {
						console.log('rollback successful');
						res.send('transaction rollback successful');
					});
				} 
				else {
					transaction.commit(function (err) {
							console.log('data commit success');


							var allItems = data.recordset;
			

							if (allItems.length > 0) {
                             req.session.Login = Login;
						     console.log("Login succeeded: ", req.session.Login);
                             res.send('Login successful: ' + 'sessionID: ' + req.session.id + '; user: ' + req.session.Login);
   
						}else {
							       console.log("Login failed: ", req.body.Login)
                                   res.status(401).send('Login error');
						}
                    });
                }
            });
        });
});

    // var foundUser;
    // // поиск пользователя в массиве users 
    // for (var i = 0; i < users.length; i++) {
    //     var u = users[i];
    //     if (u.username == req.body.username && u.password == req.body.password) {
    //         foundUser = u.username
    //     };
    // };

    // if (foundUser !== undefined) {
    //     req.session.username = req.body.username;
    //     console.log("Login succeeded: ", req.session.username);
    //     res.send('Login successful: ' + 'sessionID: ' + req.session.id + '; user: ' + req.session.username);
    // } else {
    //     console.log("Login failed: ", req.body.username)
    //     res.status(401).send('Login error');
    // }

});

app.get('/logout', function (req, res) {
    req.session.Login = '';
    console.log('logged out');
    res.send('logged out!');
});

// ограничение доступа к контенту на основе авторизации 
app.get('/admin', function (req, res) {
    // страница доступна только для админа 
    if (req.session.Login == 'admin') {
        console.log(req.session.Login + ' requested admin page');
        res.render('admin_page');
    } else {
        res.status(403).send('Access Denied!');
    }

});

app.get('/user', function (req, res) {
    // страница доступна для любого залогиненного пользователя 
    if (req.session.Login.length > 0) {
        console.log(req.session.Login + ' requested user page');
        res.render('user_page');
    } else {
        res.status(403).send('Access Denied!');
    };
});

app.get('/guest', function (req, res) {
    // страница без ограничения доступа 
    res.render('guest_page');
});

app.listen(port, function () {
    console.log('app running on port ' + port);
})
