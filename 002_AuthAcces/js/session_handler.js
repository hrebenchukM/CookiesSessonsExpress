var cookieParser = require('cookie-parser');
var session = require('express-session');
// подключение модуля connect-mssql
var MSSQLStore = require('connect-mssql')(session);
var mssql = require('mssql'); 
// параметры соединения с бд
var config = {
	user: 'admin',           // пользователь базы данных
	password: '12345',          // пароль пользователя 
	server: 'LENOVO\\SQLEXPRESS',       // хост
	database: 'ATB',          // имя бд
	port: 1433,             // порт, на котором запущен sql server
	  options: {
		  encrypt: true,  // Использование SSL/TLS
		  trustServerCertificate: true // Отключение проверки самоподписанного сертификата
	  },
 }


module.exports = {
    getConfig: function () {
        return config;
    },

    createStore: function () {
        return new MSSQLStore(config);
    }
}