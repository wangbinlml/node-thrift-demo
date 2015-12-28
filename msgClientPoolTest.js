var thrift = require('thrift');

var GetMsg = require('./gen-nodejs/GetMsg.js'),
    ttypes = require('./gen-nodejs/msg_types');

var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

var poolModule = require('generic-pool');
var pool = poolModule.Pool({
    name     : 'mysql',
    create   : function(callback) {
        try {
            var connection = thrift.createConnection('localhost', 9090);
            connection.on("error", function(err) {
                console.error(err);
                connection.end();
            });
            callback(null, connection);
        }catch(err){
            console.log(err);
        }
    },
    destroy  : function(client) { client.end(); },
    max      : 10,
    // optional. if you set this, make sure to drain() (see step 3)
    min      : 2,
    // specifies how long a resource can stay idle in pool before being removed
    idleTimeoutMillis : 30000,
    // if true, logs via console.log - can also be a function
    log : true
});

/*
var poolModule = require('./lib/thrift-pool');
var pool = poolModule.Pool({
    name: 'thrift_pool',
    create: function (callback) {
        try {
            var connection = thrift.createConnection('localhost', 9090);
            connection.on("error", function(err) {
                console.error(err);
                connection.end();
            });
            callback(null, connection);
        }catch(err){
            console.log(err);
        }
    },
    destroy: function (connection) {
        try{
            connection.end();
        }catch(err){
            console.error(err);
        }
    },
    max: 2,
    min: 2,
    idleTimeoutMillis: 300000,
    log: true,
    reapInterval: 300000
});
*/

/**
 * 释放connection
 * @param connection
 */
function releasePool(connection){
    try{
        pool.release(connection);
    }catch(err){
        console.log(err);
    }
}

/**
 * 获取connection
 */
function getClient(connection){
    //var mp = new thrift.Multiplexer();
    //var client = mp.createClient("GetMsg", GetMsg, connection);
    //pool.pushUsingObjects(connection);
    var client = client = thrift.createClient(GetMsg, connection);
    return client;
}

var msg = new ttypes.Msg({
    "service_name": "/hbb/common/auth/login",
    "params": ["account:eq:13600000008", "password:eq:000008"]
});

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
    cluster.on('listening', function (worker, address) {
        console.log("A worker is now connected to " + address.address + ":" + address.port);
    });
    cluster.on('disconnect', function (worker) {
        console.log('The worker #' + worker.id + ' has disconnected');
    });
    cluster.on('online', function (worker) {
        console.log("Yay, the worker responded after it was forked");
    });

} else {
    var server = http.createServer();
    server.on('connection', function (socket) {
        //console.log("connection");
    });
    server.on('close', function () {
        console.log("http server close");
    });
    server.on('clientError', function (exception, socket) {
        console.log("clientError");
    });
    server.on('request', function (req, res) {
        try{
            pool.acquire(function (err, connection) {
                getClient(connection).get(msg, function (err, response) {
                    releasePool(connection);
                    if (err) {
                        console.error(err);
                    } else {
                        console.log("client res:", response);
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        var data = response + '\n';
                        res.end(data);
                    }
                });
            });
        }catch(err){
            console.log(err);
        }
    });
    server.listen(3000);
}
process.on('uncaughtException', function(error){
    console.log(error);
});
