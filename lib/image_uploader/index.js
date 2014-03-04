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
                var newFilePath = path.join('images', filename);
                console.log(path.resolve(newFilePath));
                var newStream = fs.createWriteStream(newFilePath);
                console.log('made stream');
                newStream.on('open', function(fd) {
                    fileStream.pipe(newStream);
                });
            });

            // Once the stream is finished, redirect back to the index page
            multipartStream.on('finish', resolve);
            multipartStream.on('error', reject);

            // Pipe the request into the multipart stream
            req.pipe(multipartStream);
        });
    }
};
