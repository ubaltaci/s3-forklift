### s3-forklift

[aws-sdk](https://github.com/aws/aws-sdk-js) based kinda high level s3 / spaces (Digital Ocean) uploader. It wraps [upload](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property) method of aws-sdk. For file upload, `ContentType` automatically added. Also, it can remove uploaded file from the file system, after upload completed successfully.

## Install

```
npm install s3-forklift --save
```

## Test

Rename `secret.example.json` to `secret.json` with valid credentials.

Then, run test via `npm run test`

## Requirements

* Node.js 10+

## Initialize

```javascript
const Forklift = require("s3-forklift");

// Initialize;
const forklift = new Forklift({
  cloud: "<CLOUD_NAME>", // do or aws
  accessKey: "<YOUR_ACCESS_KEY>",
  secretKey: "<YOUR_SECRET_KEY>",
  bucket: "<BUCKET_NAME>",
  region: "<REGION>", // optional, default: "us-east-1"
  s3params: {ACL: "bucket-owner-read"} // optional, default: {ACL: "public-read"}
});
```


## Upload

* `source` should be string (file path) or readable stream.
* `remotePath` s3 path.
* `options` Besides the all the options of original [S3.upload](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property) you can pass 
    * `{remove: true}` to remove the source after upload completed successfully
    * `{timestamp: true}` to add timestamp at the end of url

```javascript
const url = await forklift.upload({source, remotePath, options});
```

## Example 

```javascript
// To upload file
// ContentType automatically retrieved from file name and passed to S3.upload method
// if you want to override it, you should pass {ContentType:"<CONTENT_TYPE>"} as options.
const url = await forklift.upload({
	source: "test.jpg", 
	remotePath: "test/test.jpg"
});

// To upload and then remove the file with callback
const url = await forklift.upload({
	source: "test.jpg", 
	remotePath: "test/test.jpg",
	options: {remove: true}
});

// To upload a stream without ContentType
const url = await forklift.upload({
	source: fs.createReadStream("test.jpg"), 
	remotePath: "test/test.jpg"
});

// To upload a stream with ContentType
const url = await forklift.upload({
	source: fs.createReadStream("test.jpg"), 
	remotePath: "test/test.jpg",
	options: {ContentType:"image/jpeg"}
});
```


