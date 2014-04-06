var gm = require('gm'),
    fs = require('fs'),
    Promise = require('bluebird'),
    NodeCache = require('node-cache'),
    thumbCache = new NodeCache(),
    async = require('async'),
    fork = require('child_process').fork;

var workers = [];
workers.push(fork('./lib/thumbnailer/child.js'));
workers.push(fork('./lib/thumbnailer/child.js'));

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
    workers[Math.floor(Math.random() * workers.length)].send({type: 'thumb', path: photo.filepath});
    return Promise.resolve();
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
