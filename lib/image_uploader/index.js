var path = require('path'),
    Promise = require('bluebird'),
    fs = require('fs'),
    uuid = require('uuid'),
    _ = require('lodash'),
    MultipartFormStream = require('./multipartFormStream').MultipartFormStream;

// Sourced from https://en.wikipedia.org/wiki/Internet_media_type#Type_image
const imageExts = ['image/gif', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/svg+xml'];

module.exports = {
    upload: function(req) {
        var files = [];
        var boundary = /boundary=(.+?)\b/.exec(req.headers['content-type'])[1];
        var multipartStream = new MultipartFormStream(boundary);
        var requestFinished = false;
        var filesToUpload = 0;

        return new Promise(function(resolve, reject) {
            // When the multipart stream finds a file, pipe it out to a file stream
            multipartStream.on('file', function(filename, fieldname, contentType, fileStream) {
                if (!_(imageExts).contains(contentType)) {
                    reject(filename + ' is not a valid image type');
                    multipartStream.end();
                    return;
                }
                filesToUpload++;
                var filepath = path.join('images', uuid.v4());
                files.push({filepath: filepath, filename: filename, fieldName: fieldname, contentType: contentType});

                var newStream = fs.createWriteStream(filepath);

                newStream.on('open', function() {
                    fileStream.pipe(newStream);
                });

                newStream.on('finish', function() {
                    filesToUpload--;
                    if (filesToUpload === 0 && requestFinished) {
                        resolve(files[0]);
                    }
                });
            });

            // Have the appropriate promise resolver called on stream events
            multipartStream.on('finish', function() {
                requestFinished = true;
            });
            multipartStream.on('error', reject);

            // Pipe the request into the multipart stream
            req.pipe(multipartStream);
        });
    }
};
