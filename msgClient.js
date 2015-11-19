var thrift = require('thrift');

var GetMsg = require('./gen-nodejs/GetMsg.js'),
    ttypes = require('./gen-nodejs/msg_types');

var connection = thrift.createConnection('localhost', 9090),
    client = thrift.createClient(GetMsg, connection);

var msg = new ttypes.Msg({
    "service_name": "/hbb/common/auth/login",
    "params": ["account:eq:13600000008", "password:eq:000008"]
});

connection.on('error', function (err) {
    console.error(err);
});

client.get(msg, function (err, response) {
    if (err) {
        console.error(err);
    } else {
        console.log("client res:", response);
    }
});