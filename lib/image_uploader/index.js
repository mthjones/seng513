var path = require('path'),
    Promise = require('bluebird'),
    fs = require('fs'),
    MultipartFormStream = require('./multipartFormStream').MultipartFormStream;

module.exports = {
    upload: function(req) {
        var files = [];
        var boundary = /boundary=(.+?)\b/.exec(req.headers['content-type'])[1];
        var multipartStream = new MultipartFormStream(boundary);

        return new Promise(function(resolve, reject) {
            // When the multipart stream finds a file, pipe it out to a file stream
            multipartStream.on('file', function(filename, fieldname, contentType, fileStream) {
                var filepath = path.join('images', filename);
                files.push({filepath: filepath, filename: filename, fieldName: fieldname, contentType: contentType});

                var newStream = fs.createWriteStream(filepath);
                newStream.on('open', function() {
                    fileStream.pipe(newStream);
                });
            });

            // Have the appropriate promise resolver called on stream events
            multipartStream.on('finish', function() {
                resolve(files[0]);
            });
            multipartStream.on('error', reject);

            // Pipe the request into the multipart stream
            req.pipe(multipartStream);
        });
    }
};
