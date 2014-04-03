var gm = require('gm'),
    fs = require('fs'),
    Promise = require('bluebird'),
    NodeCache = require('node-cache'),
    thumbCache = new NodeCache();

var loadThumb = function (photo) {
    return new Promise(function (resolve, reject) {
        fs.exists(photo.filepath + '.thumb', function (exists) {
            if (!exists) {
                // Create the thumb?
                reject();
            } else {
                fs.readFile(photo.filepath + '.thumb', function(err, data) {
                    thumbCache.set(photo.id.toString(), data, function(err, success) {
                        console.log(thumbCache);
                        console.log(err);
                        console.log(success);
                        resolve(data);
                    });
                });
            }
        });
    });
};

module.exports = {
    createThumb: function (photo) {
        return new Promise(function (resolve, reject) {
            gm(fs.createReadStream(photo.filepath)).size({bufferStream: true}, function (err, size) {
                var aspect = size.width / size.height;
                this.resize(400, Math.round(400 / aspect)).stream(function (err, stdout) {
                    var thumbStream = fs.createWriteStream(photo.filepath + '.thumb');
                    thumbStream.on('finish', function () {
                        resolve();
                    });
                    thumbStream.on('error', function () {
                        reject();
                    });
                    stdout.pipe(thumbStream);
                });
            });
        });
    },
    getThumb: function (photo) {
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
    }
};
