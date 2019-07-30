const Path = require("path");

const Chai = require("chai");
const Fse = require("fs-extra");

const Forklift = require("../");
const Options = require("../secret.json");
const Expect = Chai.expect;

describe("Forklift", () => {

    it("should throw error without credentials", () => {

        Expect(() => {
            new Forklift();
        }).throw();
    });

    it("should not throw error with valid credentials", () => {

        Expect(() => {
            new Forklift(Options);
        }).not.throw();
    });

    it("should return error when source not exist", (done) => {

        const forklift = new Forklift(Options);
        forklift.upload({remotePath: "forklift-test/karikatur.jpg"}).catch((error) => {
            Expect(error).to.exist;
            done();
        });
    });

    it("should return error when remotePath not exist", (done) => {

        const forklift = new Forklift(Options);
        forklift.upload({source: Path.join(__dirname, "file", "karikatur.jpg")}).catch((error) => {
            Expect(error).to.exist;
            done();
        });
    });

    it("should upload file with valid credentials", (done) => {

        const forklift = new Forklift(Options);

        forklift.upload({
            source: Path.join(__dirname, "file", "karikatur.jpg"),
            remotePath: "forklift-test/karikatur.jpg",
            options: {remove: false}
        }).then((url) => {

            Expect(url).to.exist;
            Expect(url).to.have.string("forklift-test/karikatur.jpg");
            return done();
        });
    });

    it("should upload and remove file with valid credentials", (done) => {

        const srcPath = Path.join(__dirname, "file", "karikatur-test.jpg");
        Fse.copySync(Path.join(__dirname, "file", "karikatur.jpg"), srcPath);

        const forklift = new Forklift(Options);

        forklift.upload({
            source: srcPath,
            remotePath: "forklift-test/karikatur-test.jpg"
        }).then((url) => {
            Expect(url).to.exist;
            Expect(url).to.have.string("forklift-test/karikatur-test.jpg");
            Expect(() => {
                Fse.statSync(srcPath);
            }).throw();
            return done();
        });
    });

    it("should upload readable stream with valid credentials", (done) => {

        const srcPath = Path.join(__dirname, "file", "karikatur.jpg");
        const forklift = new Forklift(Options);

        forklift.upload({
            source: Fse.createReadStream(srcPath),
            remotePath: "forklift-test/karikatur-stream.jpg"
        }).then((url) => {
            Expect(url).to.exist;
            Expect(url).to.have.string("forklift-test/karikatur-stream.jpg");
            return done();
        });
    });

    it("should upload readable stream with valid credentials and remove should not affect anything.", (done) => {

        const srcPath = Path.join(__dirname, "file", "karikatur.jpg");
        const forklift = new Forklift(Options);

        forklift.upload({
            source: Fse.createReadStream(srcPath),
            remotePath: "forklift-test/karikatur-stream.jpg",
            options: {remove: true}
        }).then((url) => {
            Expect(url).to.exist;
            Expect(url).to.have.string("forklift-test/karikatur-stream.jpg");
            return done();
        });
    });

    it("should upload readable stream with content-type and valid credentials", (done) => {

        const srcPath = Path.join(__dirname, "file", "karikatur.jpg");
        const forklift = new Forklift(Options);

        forklift.upload({
            source: Fse.createReadStream(srcPath),
            remotePath: "forklift-test/karikatur-stream-with-content-type.jpg",
            options: {ContentType: "image/png", remove: false}
        }).then((url) => {
            Expect(url).to.exist;
            Expect(url).to.have.string("forklift-test/karikatur-stream-with-content-type.jpg");
            return done();
        });
    });

    it("should upload pdf file with correct content type", (done) => {

        const srcPath = Path.join(__dirname, "file", "pdf-test.pdf");
        const forklift = new Forklift(Options);

        forklift.upload({
            source: srcPath,
            remotePath: "forklift-test/pdf-test.pdf",
            options: {remove: false}
        }).then((url) => {
            Expect(url).to.exist;
            Expect(url).to.have.string("forklift-test/pdf-test.pdf");
            return done();
        });
    });

});
