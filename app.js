const path = require('path');
const log4js = require('log4js');
log4js.configure(path.join(process.cwd(), 'config', 'log4js.json'));
const express = require('express');
const app = express();
const http = require('http').Server(app);

const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const errorHandler = require('errorhandler');

const routes = require('./routes/routes');

const logger = log4js.getLogger('app');

// all environments
const port = process.env.PORT || 3000;
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(log4js.connectLogger(logger, { level: 'auto' }));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

// development only
if ('development' === app.get('env')) {
    app.use(errorHandler());
}

app.use(routes);

http.listen(port, function () {
    logger.info('Your server is listening on port %d', port);
});
