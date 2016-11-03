import * as http from 'http';
import * as express from 'express';
import app from '../app';
import {error} from "util";

let options = {
    host: 'www.newzealand.com',
    path: '/api/rest/v1/deliver/listings?tag=auckland&level=full&maxrows=10&skip=0',
    headers: {
    }
};

const fetchRecords = function () {

    return new Promise((resolve, reject) => {
        http.get(options, (data) => {
            let content = '';
            data.setEncoding('utf8');
            data.on('data', (chunk) => content += chunk);
            data.on('end', () => {
                resolve(JSON.parse(content));
            });
        });
    });
};

const writeRecords = function(collectionName, data) {
    let collection = app.locals.db.collection(collectionName);
    data.forEach((item) => {
        collection.findOne({unique_id: item.unique_id}, (err, result) => {
            collection = app.locals.db.collection('test');
            if(err) return console.error(err);
            if(!result) {
                collection.insertOne(item);
            }
        });
    });
};


export function index(req: express.Request, res: express.Response) {
    fetchRecords().then(
        (data) => {
            let totalNumber = data.meta.total_items;
            console.log(totalNumber);
            writeRecords('test', data.items);
        }
    ).then(
        () => res.end('finished')
    ).catch((error) => console.error(error));
    // res.render('index', { title: 'fantasy' });
}
