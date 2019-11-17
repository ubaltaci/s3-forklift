"use strict";

const Fs = require("fs");
const IsStream = require("is-stream");
const AWS = require("aws-sdk");
const Mimos = require("@hapi/mimos");
const Joi = require("@hapi/joi");

const {constructorOptionsValidation, uploadOptionsValidation} = require("./option_validation");
const EndpointCreator = require("./endpoint_creator");

AWS.config.update({
    signatureVersion: "v4"
});

class Forklift {
    /**
     * Initialize Uploader
     * @param {{provider: string, accessKey: string, secretKey: string, region: string, bucket: string, s3params: Object}} options
     */
    constructor(options) {

        const {error, value: optionsWithDefault} = constructorOptionsValidation.validate(options);
        if (error) {
            throw error;
        }

        this.mimos = new Mimos();
        this.endPoint = EndpointCreator(optionsWithDefault);

        this.s3 = new AWS.S3({
            params: {
                Bucket: optionsWithDefault.bucket,
                ACL: optionsWithDefault.s3params.ACL
            },
            credentials: new AWS.Credentials({
                accessKeyId: optionsWithDefault.accessKey,
                secretAccessKey: optionsWithDefault.secretKey
            }),
            endpoint: this.endPoint
        });
    }

    /**
     * Upload file to S3
     *
     * @param {Object} upload
     * @param {string} upload.source
     * @param {string} upload.remotePath
     * @param {Object} upload.options
     * @returns {string}
     */

    async upload({source, remotePath, options = {}}) {

        const {error, value: optionsWithDefault} = uploadOptionsValidation.validate(options);
        if (error) {
            throw error;
        }

        if (!source) {
            throw new Error("source must be exist.");
        }

        if (!remotePath) {
            throw new Error("remotePath must be exist.");
        }

        const isSourceStream = IsStream.readable(source);
        const isSourceString = typeof source === "string" || source instanceof String;
        const isSourceBuffer = source instanceof Buffer;

        if (!isSourceStream && !isSourceString && !isSourceBuffer) {
            throw new Error("Source must be stream or path to existing file.");
        }

        const params = Object.assign(optionsWithDefault, {
            Body: (isSourceStream || isSourceBuffer) ? source : Fs.createReadStream(source),
            Key: remotePath
        });

        if (!params.ContentType && isSourceString) {

            const mime = this.mimos.path(source);
            if (mime && mime.type) {
                params.ContentType = mime.type;
            }
        }

        let {Location: url} = await this.s3.upload(params).promise();

        if (!url) {
            throw new Error("Upload failed");
        }

        if (optionsWithDefault.remove && isSourceString) {
            await Fs.promises.unlink(source);
        }

        if (optionsWithDefault.timestamp) {
            url = `${url}?${Date.now()}`;
        }

        return url;
    }
}

module.exports = Forklift;
