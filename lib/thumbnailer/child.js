var gm = require('gm'),
    path = require('path'),
    fs = require('fs'),
    async = require('async');

process.on('message', function(message) {
    if (message.type === "thumb") {
        createThumb(message.path);
    }
});

var workerQueue = async.queue(function(filepath, callback) {
    gm(fs.createReadStream(filepath)).size({bufferStream: true}, function (err, size) {
        var aspect = size.width / size.height;
        this.resize(400, Math.round(400 / aspect)).stream(function (err, stdout) {
            var thumbStream = fs.createWriteStream(path.join(path.dirname(filepath), 'thumbs', path.basename(filepath) + '.thumb'));
            thumbStream.on('finish', function () {
                callback();
            });
            thumbStream.on('error', function () {
                callback('error creating thumb');
            });
            stdout.pipe(thumbStream);
        });
    });
}, 32);

var createThumb = function(filepath) {
    workerQueue.push(filepath);
};
