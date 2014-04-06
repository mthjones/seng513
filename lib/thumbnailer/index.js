var gm = require('gm'),
    fs = require('fs'),
    Promise = require('bluebird'),
    NodeCache = require('node-cache'),
    thumbCache = new NodeCache(),
    async = require('async');

var workerQueue = async.queue(function(data, callback) {
    gm(fs.createReadStream(data.photo.filepath)).size({bufferStream: true}, function (err, size) {
        var aspect = size.width / size.height;
        this.resize(400, Math.round(400 / aspect)).stream(function (err, stdout) {
            var thumbStream = fs.createWriteStream(data.photo.getThumbpath());
            thumbStream.on('finish', function () {
                callback();
                data.cb();
            });
            thumbStream.on('error', function () {
                callback('error creating thumb');
            });
            stdout.pipe(thumbStream);
        });
    });
}, 32);

var loadThumb = function (photo) {
    return new Promise(function (resolve, reject) {
        fs.exists(photo.getThumbpath(), function (exists) {
            if (!exists) {
                createThumb(photo).then(function() {
                    return getThumb(photo);
                }).then(function(thumb) {
                    resolve(thumb);
                });
            } else {
                fs.readFile(photo.getThumbpath(), function(err, data) {
                    thumbCache.set(photo.id.toString(), data, function() {
                        resolve(data);
                    });
                });
            }
        });
    });
};

var createThumb = function (photo) {
    return new Promise(function(resolve, reject) {
        workerQueue.push({photo: photo, cb: function() { resolve() }});
    });
};

var getThumb = function (photo) {
    return new Promise(function (resolve, reject) {
        thumbCache.get(photo.id.toString(), function (err, thumb) {
            if (err) reject(err);
            if (Object.keys(thumb).length === 0) {
                loadThumb(photo).then(function (loadedThumb) {
                    resolve(loadedThumb);
                });
            } else {
                resolve(thumb[photo.id]);
            }
        });
    });
};

module.exports = {
    createThumb: createThumb,
    getThumb: getThumb
};
