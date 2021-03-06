var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var auth = express.Router();
var articles = express.Router();
var http = require('http');
var auth = express.Router();
var articles = express.Router();
var session = require('express-session');

var app = express();

var passport = require('passport');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);
var TWO_DAYS = 2 * 24 * 60 * 60;
var redirectNotAuthenticated = require('./controllers/redirectNotAuthenticated');
var redirectAuthenticated = require('./controllers/redirectAuthenticated');
var cors = require('cors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(cors({credentials: true}));
app.use(cookieParser());
app.use(session({
  secret: 'anyStringOfText',
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: TWO_DAYS
  })
}));
app.use(passport.initialize());
app.use(passport.session());//use after express session as it combines them together
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', auth);
app.use('/articles', articles);

require('./initializer/passport')(passport);
require('./routes/auth.js')(auth, passport);
require('./routes/articles.js')(articles);

app.get("/", function(req, res) {
  res.render('index');
});

app.delete('/logout', function(req, res) {
  res.setHeader('content-type', 'text/plain');
  res.writeHead(200);
  req.session.destroy();
  res.end();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(8080);
