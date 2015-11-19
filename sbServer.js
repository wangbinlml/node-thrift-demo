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
    var server = http.createServer();
    server.on('connection', function (socket) {
        //console.log("connection");
    });
    server.on('close', function () {
        console.log("close");
    });
    server.on('clientError', function (exception, socket) {
        console.log("connection");
    });
    server.on('request', function (req, res) {
        var connection = thrift.createConnection('127.0.0.1', 9090),
            client = thrift.createClient(GetMsg, connection);

        var msg = new ttypes.Msg({
            "service_name": "/hbb/common/auth/login",
            "params": ["account:eq:13600000008", "password:eq:000008"]
        });

        connection.on('error', function (err) {
            console.error(err);
            connection.end();
        });

        client.get(msg, function (err, response) {
            connection.end();
            if (err) {
                console.error(err);
            } else {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                var data = JSON.stringify(response);
                res.end(data);
            }
        });
    });
    server.listen(3000);
}
