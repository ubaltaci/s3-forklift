"use strict";

const Fs = require("fs");
const IsStream = require("is-stream");
const AWS = require("aws-sdk");
const Mimos = require("mimos");
const Async = require("async");
const Joi = require("joi");

AWS.config.update({
    signatureVersion: "v4"
});

const optionSchema = Joi.object().keys({

    accessKey: Joi.string().min(15).max(30).required(),
    secretKey: Joi.string().required(),
    bucket: Joi.string().required(),
    region: Joi.string().default("us-east-1"),
    s3params: Joi.any().default({ACL: "public-read"}),
    // Default parameters :( ES6
    "default": Joi.any()
});

class Forklift {

    /**
     * Initialize Uplader
     * @param {{accessKey: string, secretKey: string, bucket: string, region:string}} options
     */
    constructor(options) {

        const result = Joi.validate(options, optionSchema);

        if (result.error) {
            throw result.error;
        }

        this.options = result.value;
        this.mimos = new Mimos();

        AWS.config.credentials = new AWS.Credentials(this.options.accessKey, this.options.secretKey);

        this.remoteUrl = this.options.region === "us-east-1" ?
            `https://s3.amazonaws.com/${this.options.bucket}/` :
            `https://s3-${this.options.region}.amazonaws.com/${this.options.bucket}/`;

        this.s3 = new AWS.S3({
            params: {
                Bucket: this.options.bucket,
                ACL: this.options.s3params.ACL
            }
        });
    }

    /**
     * @callback UploadCallback
     * @param {Error} error
     * @param {string} [url]
     */

    /**
     * Upload file to S3
     * @param {string} source
     * @param {string} s3RemotePath
     * @param {object} [options]
     */
    async upload(source, s3RemotePath, options = {}) {

        return new Promise((resolve, reject) => {

            if (!options.hasOwnProperty("remove")) {
                options.remove = true;
            }

            if (!options.hasOwnProperty("timestamp")) {
                options.timestamp = true;
            }

            if (!source) {
                return reject(new Error("Source should be exist."));
            }

            const isSourceStream = IsStream.readable(source);
            const isSourceString = (typeof source === "string" || source instanceof String);
            const isSourceBuffer = source instanceof Buffer;

            if (!isSourceStream && !isSourceString && !isSourceBuffer) {
                return reject(new Error("Source should be stream or path to existing file."));
            }

            if (!s3RemotePath || !(typeof s3RemotePath === "string" || s3RemotePath instanceof String)) {
                return reject(new Error("s3RemotePath should be exist"));
            }

            const params = Object.assign(options, {
                "Body": (isSourceStream || isSourceBuffer) ? source : Fs.createReadStream(source),
                "Key": s3RemotePath
            });

            Async.auto({

                "uploadFile": (autoCallback) => {

                    if (!params.ContentType && isSourceString) {

                        const mime = this.mimos.path(source);
                        if (mime && mime.type) {
                            params.ContentType = mime.type;
                        }
                    }

                    if (!params.ContentType) { // Content-type still not exist, check with remote folder.

                    }

                    this.s3.upload(params, (error) => {

                        if (error) {
                            console.log(error);
                            return autoCallback(error);
                        }

                        let url = this.remoteUrl + s3RemotePath;
                        if (options.timestamp) {
                            url = `${url}?${Date.now()}`;
                        }

                        return autoCallback(null, url);
                    });
                },
                "removeFile": ["uploadFile", (result, autoCallback) => {

                    if (!options.remove || !isSourceString) {
                        return autoCallback();
                    }

                    Fs.unlink(source, autoCallback);
                }]
            }, (error, result) => {

                if (error) {
                    return reject(error);
                }

                const url = result.uploadFile;
                return resolve(url);
            });
        });
    }
}

module.exports = Forklift;