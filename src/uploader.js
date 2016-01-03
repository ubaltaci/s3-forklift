const Fs = require("fs");
const IsStream = require("is-stream");
const AWS = require("aws-sdk");
const Mimos = require("mimos");
const Joi = require("joi");

const optionSchema = Joi.object().keys({

    accessKey: Joi.string().min(15).max(30).required(),
    secretKey: Joi.string().required(),
    bucket: Joi.string().required(),
    region: Joi.string().default("us-east-1"),
    s3params: Joi.any().default({ACL: "public-read"}),
    // Default parameters :( ES6
    "default": Joi.any()
});

class Uploader {

    /**
     * Initialize Uplader
     * @param {{accessKey: string, secretKey: string, bucket: string, region:string}} options
     */
    constructor(options = {}) {

        const result = Joi.validate(options, optionSchema);

        if (result.error) {
            throw result.error;
        }

        this.options = result.value;

        AWS.config.accessKeyId = this.options.accessKey;
        AWS.config.secretAccessKey = this.options.secretKey;

        this.mimos = new Mimos();

        this.remoteUrl = this.options.region == "us-east-1" ?
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
     * @param {Error} Error
     * @param {string} [RemoteUrl]
     */

    /**
     * Upload file to S3
     * @param {string} source
     * @param {string} s3RemotePath
     * @param {object} [options]
     * @param {UploadCallback} callback
     */
    upload(source, s3RemotePath, options, callback) {

        callback = typeof options == "function" ? options : callback;
        options = typeof options == "function" ? {} : options;

        if (!source) {
            return callback(new Error("Source should be exist."));
        }

        const isSourceStream = IsStream.readable(source);
        const isSourceString = (typeof source == "string" || source instanceof String);

        if (!isSourceStream && !isSourceString) {
            return callback(new Error("Source should be stream or path to existing file."));
        }

        if (!s3RemotePath || !(typeof s3RemotePath == "string" || s3RemotePath instanceof String)) {
            return callback(new Error("s3RemotePath should be exist"));
        }

        const params = Object.assign(options, {
            "Body": isSourceStream ? source : Fs.createReadStream(source),
            "Key": s3RemotePath
        });

        if (!params.ContentType) {
            params.ContentType = isSourceString ? this.mimos.path(source).type : options.ContentType || ""
        }

        this.s3.upload(params, (error) => {

            if (error) {
                return callback(error);
            }

            if (!!options.remove && isSourceString) {
                return Fs.unlink(source, (error) => {
                    if (error) {
                        return callback(error);
                    }
                    return callback(null, this.remoteUrl + s3RemotePath);
                });
            }

            return callback(null, this.remoteUrl + s3RemotePath);
        });
    }
}

export default Uploader;