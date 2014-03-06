var Buffer = require('buffer').Buffer,
    util = require('util'),
    stream = require('stream');

/**
 * Returns the index of the given buffer in the receiving buffer if it exists, or
 * -1 otherwise.
 * @param {Buffer} buffer The buffer to find
 * @returns {number} The index of the given buffer
 */
Buffer.prototype.indexOf = function(buffer) {
    var index = 0;
    for (var i=0; i < this.length; i++) {
        if (this[i] === buffer[i - index]) {
            if (i - index === buffer.length - 1) return index;
        } else {
            i = ++index;
        }
    }
    return -1;
};

/**
 * Create a writable stream for a multipart form request
 * @param {string} boundary The boundary for the multipart sections
 * @param {object} [options] Options for the writable stream
 * @constructor
 */
MultipartFormStream = function(boundary, options) {
    stream.Writable.call(this, options);
    this.boundary = new Buffer(boundary);
};
util.inherits(MultipartFormStream, stream.Writable);

MultipartFormStream.prototype._write = function(chunk, encoding, callback) {
    var endBoundary;

    if (!this.inBoundaries) {
        var startBoundary = chunk.indexOf(new Buffer('--' + this.boundary.toString()));

        if (startBoundary !== -1) {
            var headerBoundary = chunk.indexOf(new Buffer('\r\n\r\n'));
            var headers = chunk.slice(startBoundary + this.boundary.length + 2, headerBoundary).toString();
            var contentDisposition = /Content-Disposition: (.+?)\r\n/.exec(headers)[1];
            var contentType = /Content-Type: (.+)/.exec(headers)[1];
            var fieldname = /\bname="(.+?)"/.exec(contentDisposition)[1];
            var filenameMatch = /\bfilename="(.+?)"/.exec(contentDisposition);
            var filename = filenameMatch ? filenameMatch[1] : undefined;

            // Create a passthrough stream. This takes anything written to it and allows it to be read with
            // no transformation.
            this.fieldStream = new stream.PassThrough();

            if (filename) {
                this.emit('file', filename, fieldname, contentType, this.fieldStream);
            } else {
                this.emit('field', fieldname, this.fieldStream);
            }

            endBoundary = chunk.slice(startBoundary + this.boundary.length + 2).indexOf(new Buffer('--' + this.boundary.toString()));

            if (endBoundary !== -1) {
                this.fieldStream.push(chunk.slice(headerBoundary + 4, endBoundary + 5));
                // This shouldn't be here, but since we're operating under the constraint of only one field being
                // contained in the request, we can get away with it.
                this.fieldStream.push(null);
            } else {
                this.inBoundaries = true;
                this.fieldStream.push(chunk.slice(headerBoundary + 4));
            }
        }
    } else {
        endBoundary = chunk.indexOf(new Buffer('--' + this.boundary.toString()));

        if (endBoundary !== -1) {
            this.inBoundaries = false;
            this.fieldStream.push(chunk.slice(0, endBoundary - 1));
            this.fieldStream.push(null);
        } else {
            this.fieldStream.push(chunk);
        }
    }
    callback();
};

exports.MultipartFormStream = MultipartFormStream;
