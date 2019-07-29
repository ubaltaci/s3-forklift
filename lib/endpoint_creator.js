const BASE_URL = {
    aws: "amazonaws.com",
    do: "digitaloceanspaces.com"
};

/**
 * @param {Object} config
 * @param {("aws"|"do")} config.provider
 * @param {string} config.region
 * @returns {string}
 */
module.exports = ({provider = "aws", region = ""}) => {

    // do example -> https://${region}.cdn.digitaloceanspaces.com
    // aws example -> https://s3.${region}.amazonaws.com

    const baseUrl = BASE_URL[provider];
    return `https://${provider === "aws" ? "s3." : ""}${region}.${baseUrl}/`;
};
