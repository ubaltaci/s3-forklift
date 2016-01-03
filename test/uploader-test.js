import * as Path from "path";
import * as Fse from "fs-extra";
import * as Chai from "chai";

import Uploader from "../";
import * as Options from "../secret.json";

const Expect = Chai.expect;

describe("Uploader", () => {

    it("should throw error without credentials", () => {

        Expect(() => {
            new Uploader()
        }).throw();
    });

    it("should not throw error with valid credentials", () => {

        Expect(() => {
            new Uploader(Options)
        }).not.throw();
    });

    it("should return error when source not exist", (done) => {

        const uploader = new Uploader(Options);
        uploader.upload("", "uploader-test/karikatur.jpg", (error, url) => {
            Expect(error).to.exist;
            Expect(url).to.not.exist;
            done();
        });
    });

    it("should return error when s3RemotePath not exist", (done) => {

        const uploader = new Uploader(Options);
        uploader.upload(Path.join(__dirname, "file", "karikatur.jpg"), "", (error, url) => {
            Expect(error).to.exist;
            Expect(url).to.not.exist;
            done();
        });
    });

    it("should upload file with valid credentials", (done) => {

        const uploader = new Uploader(Options);

        uploader.upload(Path.join(__dirname, "file", "karikatur.jpg"), "uploader-test/karikatur.jpg", (error, url) => {

            Expect(error).to.not.exist;
            Expect(url).to.exist;
            Expect(url).to.have.string("uploader-test/karikatur.jpg");
            return done();
        });
    });

    it("should upload and remove file with valid credentials", (done) => {

        const srcPath = Path.join(__dirname, "file", "karikatur-test.jpg");
        Fse.copySync(Path.join(__dirname, "file", "karikatur.jpg"), srcPath);

        const uploader = new Uploader(Options);

        uploader.upload(srcPath, "uploader-test/karikatur-test.jpg", {remove: true}, (error, url) => {
            Expect(error).to.not.exist;
            Expect(url).to.exist;
            Expect(url).to.have.string("uploader-test/karikatur-test.jpg");
            Expect(() => {
                Fse.statSync(srcPath)
            }).throw();
            return done();
        });
    });

    it("should upload readable stream with valid credentials", (done) => {

        const srcPath = Path.join(__dirname, "file", "karikatur.jpg");
        const uploader = new Uploader(Options);

        uploader.upload(Fse.createReadStream(srcPath), "uploader-test/karikatur-stream.jpg", (error, url) => {
            Expect(error).to.not.exist;
            Expect(url).to.exist;
            Expect(url).to.have.string("uploader-test/karikatur-stream.jpg");
            return done();
        });
    });

    it("should upload readable stream with valid credentials and remove should not affect anything.", (done) => {

        const srcPath = Path.join(__dirname, "file", "karikatur.jpg");
        const uploader = new Uploader(Options);

        uploader.upload(Fse.createReadStream(srcPath), "uploader-test/karikatur-stream.jpg", {remove: true}, (error, url) => {
            Expect(error).to.not.exist;
            Expect(url).to.exist;
            Expect(url).to.have.string("uploader-test/karikatur-stream.jpg");
            return done();
        });
    });

    it("should upload readable stream with content-type and valid credentials", (done) => {

        const srcPath = Path.join(__dirname, "file", "karikatur.jpg");
        const uploader = new Uploader(Options);

        uploader.upload(Fse.createReadStream(srcPath), "uploader-test/karikatur-stream-with-content-type.jpg", {ContentType: "image/jpeg"}, (error, url) => {
            Expect(error).to.not.exist;
            Expect(url).to.exist;
            Expect(url).to.have.string("uploader-test/karikatur-stream-with-content-type.jpg");
            return done();
        });
    });

});