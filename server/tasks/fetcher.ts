import * as http from 'http';
import * as url from 'url';
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

import {error} from "util";

config();

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

class TNZRegion {
    unique_id: number;
    o_id: number;
    label: string;
    name_key: string;
    market: string;
}
class TNZTag {
    unique_id: number;
    o_id: number;
    label: string;
    listing_count: number;
    name_key: string;
    market: string;
}

class TNZResponse {
    items: any[];
    link: TNZLink;
    meta: TNZMeta;
}

const locals = {
    db: null
};


const fetchRecords = function(link: string): Promise<TNZResponse> {
    console.log('Fetching ' + link);

    let urlObj: url.Url = url.parse(link),
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

const writeRecords = function(collectionName: string, data: TNZResponse): Promise<TNZResponse> {
    let collection = locals.db.collection(collectionName);

    let promises: Promise<any>[] = [];
    data.items.forEach((item) => {
        let promise = new Promise((resolve, reject) => {
            collection.find({unique_id: item.unique_id}).limit(1).next((e, r) => {
                if(e) {
                    reject(e);
                } else if(!r) {
                    collection.insertOne(item, (e, r) => {
                        if(e) {
                            reject(e);
                        } else {
                            resolve(r);
                        }
                    })
                } else {
                    //Should update record here;
                    resolve(r);
                }
            })
        });

        promises.push(promise);
    });

    return new Promise((resolve, reject) => {
        Promise.all(promises)
            .then(
                (values) => resolve(data)
            ).catch(
                (e) => reject(e)
            )
    });
};

const getCollectionRecords = function(collectionName: string, firstLink: string): Promise<TNZResponse> {
    return fetchRecords(firstLink)
        .then(
            (data: TNZResponse) => writeRecords(collectionName, data)
        ).then(
            (data: TNZResponse) => {
                if(data.link.next) {
                    return getCollectionRecords(collectionName, data.link.next);
                }
            }
        ).catch((e) => console.error(e));
};

const getListingsByTag = function(tag: TNZTag): Promise<any[]> {
    return new Promise((resolve, reject) => {
        if(tag.name_key === 'auckland') return;
        let firstLink = 'http://www.newzealand.com/api/rest/v1/deliver/listings?level=full&maxrows=30&skip=0&tag=' + tag.name_key;
        getCollectionRecords('listing', firstLink)
            .then(
                (listings) => resolve(listings),
                (e) => reject(e)
            );
    });
};

const getListings = function(): Promise<any[]> {
    let collection = locals.db.collection('tag');

    return new Promise((resolve, reject) => {
        collection.find().toArray((e, tags: TNZTag[]) => {
            let promises: Promise<any>[] = [];
            tags.forEach((tag) => {
                if(tag.name_key === 'auckland') return;
                promises.push(getListingsByTag(tag))
            });

            Promise.all(promises).then(
                (listingsGroup) => resolve(listingsGroup)
            ).catch(
                (e) => reject(e)
            );
        });
    });
};


export function index() {
    let tagLink = 'http://www.newzealand.com/api/rest/v1/deliver/tags/listingcount?sort=1&maxrows=200&skip=0',
        regionLink = 'http://www.newzealand.com/api/rest/v1/deliver/regions/?level=simple&maxrows=50&skip=0';
    getCollectionRecords('region', regionLink)
        .then(
            () => {
                console.log('finished');
                locals.db.close();
                process.exit();
            }
        ).catch(
            (e) => console.error(e)
        );

    // return getListings()
    //     .then(
    //         () => console.log('finished')
    //     ).catch(
    //         (e) => console.error(e)
    //     );
}

MongoClient.connect(process.env.DB, (e, db) => {
    if(e) return console.error(e);
    locals.db = db;
    index();
});


