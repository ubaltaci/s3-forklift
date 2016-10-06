## s3-forklift

[aws-sdk](https://github.com/aws/aws-sdk-js) based kinda high level s3 uploader. It wraps [upload](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property) method of aws-sdk. For file upload, `ContentType` automatically added. Also, it can remove uploaded file from the file system, after upload completed successfully.

## Install

```
npm install s3-forklift --save
```

## Requirements

* Node.js 6+

## Initialize

```javascript
const Forklift = require("s3-forklift");

// Initialize;
const forklift = new Forklift({
  accessKey: "<YOUR_ACCESS_KEY>",
  secretKey: "<YOUR_SECRET_KEY>",
  bucket: "<BUCKET_NAME>",
  region: "eu-central-1", // optional, default: "us-east-1"
  s3params: {ACL: "bucket-owner-read"} // optional, default: {ACL: "public-read"}
});
```
## Upload

* `source` should be string (file path) or readable stream.
* `s3RemotePath` s3 path.
* `options` are optional. Besides the all the options of original [S3.upload](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property) you can pass `{remove: true}` to remove the source if the source is a file after upload completed successfully.

```javascript
forklift.upload(source, s3RemotePath, /*options*/, (error, url) => {
	// region + bucket merged to get url as absolute
	// like; https://s3.amazonaws.com/bucket_name/file_path
});
```

## Example 

```javascript
// To upload file
// ContentType automatically retrieved from file name and passed to S3.upload
// if you want to override it, you should pass {ContentType:"<CONTENT_TYPE>"} as options.

forklift.upload("test.jpg", "test/test.jpg", (error, url) => {
	
});

// To upload and then remove the file
forklift.upload("test.jpg", "test/test.jpg", {remove: true}, (error, url) => {
	
});

// To upload a stream without ContentType
forklift.upload(fs.createReadStream("test.jpg"), "test/test.jpg", (error, url) => {
	
});

// To upload a stream with ContentType
forklift.upload(fs.createReadStream("test.jpg"), "test/test.jpg", {ContentType:"image/jpeg"}, (error, url) => {
	
});
```

## Test

Rename `secret.example.json` to `secret.json` with valid credentials and bucket-name.

Then, run test via `npm run test`