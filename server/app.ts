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

let env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    app.use(errorHandler());
}

app.get('/', routes.index);

let url = 'mongodb://localhost:27017/fantasy';

MongoClient.connect(url, (err, db) => {
    if(err) {
        return console.error(err);
    }
    app.locals.db = db;
    app.listen(3000, function(){
        console.log("Demo Express server listening on port %d in %s mode", 3000, app.settings.env);
    });
});

export default app;