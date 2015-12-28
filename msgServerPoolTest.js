var thrift = require('thrift');

var GetMsg = require('./gen-nodejs/GetMsg.js'),
    ttypes = require('./gen-nodejs/msg_types');

var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

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
    try {
        var server = thrift.createServer(GetMsg, {
            get: function (msg, result) {
                result(null, JSON.stringify(msg));
            }
        }, {});

        server.listen(9090);
    }catch(e){
        console.error(e);
    }
}