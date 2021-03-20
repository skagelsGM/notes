var createError = require('http-errors');

var express = require('express'),
    path = require('path');

var markdownServer = require('markdown-serve');
var serveIndex = require('serve-index');

var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var markdownRedirector = function(req, res) {
  let redirect_path = req.originalUrl.slice(0, -3);
  console.log(`REQUEST ${req.originalUrl}\nREDIRECT TO ${redirect_path}`);
  res.redirect(redirect_path);
};

app.use('/notes/public/images', express.static(path.join(__dirname, 'public/images'))
);
app.get('/notes/*.md', markdownRedirector);
app.get('/notes/*/*.md', markdownRedirector);

app.use('/notes', express.static('docs'), serveIndex('docs', {'icons': true}));

app.use('/notes', markdownServer.middleware({
  rootDirectory: path.resolve(__dirname, 'docs'),
  view: 'markdown',
  preParse: true
}));

app.get('/notes', function(req, res){
  res.sendfile('/notes/index');
});

app.use('/notes/img', express.static(path.join(__dirname, 'docs/img')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res){
  res.redirect('/notes/README');
});

// app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
