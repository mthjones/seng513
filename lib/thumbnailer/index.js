var gm = require('gm'),
    fs = require('fs'),
    Promise = require('bluebird');

module.exports = {
    createThumb: function(photo) {
        return new Promise(function(resolve, reject) {
            gm(fs.createReadStream(photo.filepath)).size({bufferStream: true}, function(err, size) {
                var aspect = size.width / size.height;
                this.resize(400, Math.round(400 / aspect)).stream(function(err, stdout) {
                    var thumbStream = fs.createWriteStream(photo.filepath + '.thumb');
                    thumbStream.on('finish', function() {
                        resolve();
                    });
                    thumbStream.on('error', function() {
                        reject();
                    });
                    stdout.pipe(thumbStream);
                });
            });
        });
    }
};
