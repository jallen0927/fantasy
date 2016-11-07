import * as express from 'express';
import * as path from 'path';
import * as dotenv from 'dotenv';
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import { MongoClient }  from 'mongodb';

import * as routes from "./routes/index";

dotenv.config();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use('/app', express.static(path.join(__dirname, '../client/dist')));
app.use('/lib', express.static(path.join(__dirname, '../node_modules')));

let env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    app.use(errorHandler());
}

app.get('/', routes.index);

MongoClient.connect(process.env.DB, (e, db) => {
    if(e) {
        return console.error(e);
    }
    app.locals.db = db;
    app.listen(3000, function(){
        console.log("Demo Express server listening on port %d in %s mode", 3000, app.settings.env);
    });
});

export default app;