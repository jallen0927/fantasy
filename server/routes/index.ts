import * as http from 'http';
import * as url from 'url';
import * as express from 'express';
import app from '../app';

import {error} from "util";
import {resolve} from "url";
import {Url} from "url";

class TNZLink {
    prev: string;
    next: string;
    last: string;
    first: string;
}

class TNZMeta {
    total_items: number;
    items_skipped: number;
    items_retrieved: number;
    max_items_to_retrieve: number;
}

class TNZResponse {
    items: any[];
    link: TNZLink;
    meta: TNZMeta;
}

const fetchRecords = function(link: string): Promise<TNZResponse> {
    let urlObj: Url = url.parse(link),
        options = {
            host: urlObj.host,
            path: urlObj.path,
            headers: {
                Authorization: 'Bearer ' + process.env.AUTH_KEY
            }
        };
    return new Promise((resolve, reject) => {
        http.get(options, (res) => {
            let content = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                content += chunk
            });
            res.on('end', () => {
                resolve(JSON.parse(content));
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
};

const writeRecords = function(collectionName: string, data: any[]): void {
    let collection = app.locals.db.collection(collectionName);

    data.forEach((item) => {
        collection.findOne({o_id: item.o_id}, (e, result) => {
            collection = app.locals.db.collection(collectionName);
            if(e) return console.error(e);
            if(!result) {
                collection.insertOne(item);
            }
        });
    });
};

const getAllRecords = function(collectionName: string, firstLink: string): Promise<TNZResponse> {
    return fetchRecords(firstLink)
        .then((data: TNZResponse) => {
            writeRecords(collectionName, data.items);
            if(data.link.next) {
                return fetchRecords(data.link.next);
            }
        }).catch((e) => console.error(e));
};


export function index(req: express.Request, res: express.Response) {
    let firstLink = 'http://www.newzealand.com/api/rest/v1/deliver/tags/listingcount?sort=1&maxrows=100&skip=0';

    fetchRecords(firstLink)
        .then(
            (res: TNZResponse) => writeRecords('tag', res.items)
        ).then(
            () => res.end('finished')
        ).catch(
            (e) => console.error(e)
        );
}
