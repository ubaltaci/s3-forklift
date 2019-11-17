const Joi = require("@hapi/joi");

module.exports = {
    constructorOptionsValidation: Joi.object({
        provider: Joi.string().valid("aws", "do").required(),
        accessKey: Joi.string().min(15).max(30).required(),
        secretKey: Joi.string().required(),
        region: Joi.string().required(),
        bucket: Joi.string().required(),
        s3params: Joi.any().default({ACL: "public-read"})
    }),
    uploadOptionsValidation: Joi.object({
        remove: Joi.boolean().default(true),
        timestamp: Joi.boolean().default(true),
        ContentType: Joi.string()
    }).unknown(true)
};
