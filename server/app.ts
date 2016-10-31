import * as express from 'express';
import * as path from 'path';
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");

import * as routes from "./routes/index";

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    app.use(errorHandler());
}

app.get('/', routes.index);

app.listen(3000, function(){
    console.log("Demo Express server listening on port %d in %s mode", 3000, app.settings.env);
});

export default app;