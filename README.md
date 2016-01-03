##uploader

uploader-s3; [aws-sdk](https://github.com/aws/aws-sdk-js) based kinda high level s3 uploader. It wraps [upload](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property) method of aws-sdk`s S3.

## Install

```
npm install s3-forklift --save
```

## Requirements

* Node.js 4 or newer

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
* `options` are optional besides the all the options of original [S3.upload](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property) you can pass `{remove: true}` to remove the source if the source is a file.

```javascript
forklift.upload(source, s3RemotePath, /*options*/, (error, url) => {
	// region + bucket merged to get url as absolute
	// like; https://s3.amazonaws.com/bucket_name/file_path
});
```

## Example 

```javascript
// To upload file
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

## Build from source

`npm run build`