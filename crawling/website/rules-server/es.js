var exports = module.exports;

const crypto = require('crypto');

const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: 'localhost:9200'
});
const remoteClient = new elasticsearch.Client({
    host: '103.220.68.79:9200'
});

let index_name = 'article_status';
let index_type = 'article_status';

exports.addUrlToEsStatus = async function(url, hostname, remote=false) {
    try {
        let clientEs = client;
        if (remote) {
            clientEs = remoteClient;
        }

        const res =  await clientEs.index({
            index: index_name,
            type: index_type,
            id: crypto.createHash('sha256').update(url).digest('hex'),
            body: {
                url: url,
                status: 'DISCOVERED',
                metadata: {
                    hostname: hostname
                },
                nextFetchDate: new Date().toISOString()
            },
            refresh: 'true',
            routing: hostname // magic here @@
        });
        return res;
    } catch (error) {
        throw 'error';
    }
};

exports.removeUrlFromEsStatus = async function(url) {
    try {
        const res = await client.deleteByQuery({
            index: index_name,
            conflicts: 'proceed',
            body: {
                query: {
                    match: {
                        url: url
                    }
                }
            }
        });
        return res;
    } catch (error) {
        throw 'error';
    }
}

exports.removeUrlsByHostname = async function(hostname) {
    try {
        const res = await client.deleteByQuery({
            index: index_name,
            conflicts: 'proceed',
            body: {
                query: {
                    wildcard: {
                        url: `*${hostname}*`
                    }
                }
            }
        });
        return res;
    } catch (error) {
        console.log(error)
        throw 'error';
    }
}

exports.removeRecordFromEsIndex = async function(url) {
    console.log(url)
    try {
        const res = await client.deleteByQuery({
            index: 'index',
            conflicts: 'proceed',
            body: {
                query: {
                    match: {
                        url: url
                    }
                }
            }
        });
        return res;
    } catch (error) {
        console.log(error)
        throw 'error';
    }
}

exports.removeRecordsByHostname = async function(hostname) {
    try {
        const res = await client.deleteByQuery({
            index: 'index',
            conflicts: 'proceed',
            body: {
                query: {
                    wildcard: {
                        url: `*${hostname}*`
                    }
                }   
            }
        });
        return res;
    } catch (error) {
        console.log(error)
        throw 'error';
    }
}