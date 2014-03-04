var path = require('path'),
    Promise = require('bluebird'),
    fs = require('fs'),
    MultipartFormStream = require('./multipartFormStream').MultipartFormStream;

module.exports = {
    upload: function(req) {
        var boundary = /boundary=(.+?)\b/.exec(req.headers['content-type'])[1];
        var multipartStream = new MultipartFormStream(boundary);

        return new Promise(function(resolve, reject) {
            // When the multipart stream finds a file, pipe it out to a file stream
            multipartStream.on('file', function(filename, fieldname, fileStream) {
                var newStream = fs.createWriteStream(path.join('images', filename));
                newStream.on('open', function(fd) {
                    fileStream.pipe(newStream);
                });
            });

            // Have the appropriate promise resolver called on stream events
            multipartStream.on('finish', resolve);
            multipartStream.on('error', reject);

            // Pipe the request into the multipart stream
            req.pipe(multipartStream);
        });
    }
};
