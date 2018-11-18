const http = require('http');
const https = require('https');
const fs = require('fs');
const zlib = require("zlib");
const path = require("path");
const exec = require('child_process').exec;

const writeDir = "packages";

class FetchPackages {
    urlConstructior(distro, arch) {
        return `${this.baseUrl}${distro}${this.arcPrefix}${arch}/${this.fileToFetch}`
    }

    fileNameConstructor(distro, arch) {
        return `${distro}-${arch}`
    }

    downloadFile(fileName, url) {
        if (!fs.existsSync(fileName)) {
            let file = fs.createWriteStream(fileName);
            let request = this.httpImpl.get(url, function(response) {
                response.pipe(file);
            });
        }
    }

    fetchAllFiles() {
        for (let distro of this.distros) {
            for (let arch of this.archs) {
                let url = this.urlConstructior(distro, arch);
                let fileName = this.fileNameConstructor(distro, arch);
                let tarPath = `${writeDir}/${fileName}.gz`;
                this.downloadFile(tarPath, url);
                if (this.shouldWriteToFile && fs.existsSync(tarPath)) {
                    this.unzip(tarPath,`${writeDir}/${fileName}.txt`);
                }
            }
        }
    }

    unzip(tarballPath, dstPath) {
        fs.createReadStream(tarballPath)
            .on('error', console.error)
            .pipe(zlib.Unzip())
            //.pipe(tar.Parse())
            .pipe(fs.createWriteStream(dstPath));
    }
}

class RasbianPackages extends FetchPackages {
    constructor() {
        super();
        this.shouldWriteToFile = false;
        this.httpImpl = https;
        this.baseUrl = "https://archive.raspbian.org/raspbian/dists/";
        this.distros = ["buster", "jessie", "oldoldstable", "oldstable", 
                        "stable", "stretch", "testing", "wheezy"];
        this.archs = ["armhf"];
        this.arcPrefix = "/main/binary-";
        this.fileToFetch = "Packages.gz";
    }
    fileNameConstructor(distro, arch) {
        return `raspbian-${super.fileNameConstructor(distro,arch)}`;
    }
}

class UbuntuPackages extends FetchPackages {
    constructor() {
        super();
        this.shouldWriteToFile = false;
        this.httpImpl = http;
        this.baseUrl = "http://cz.archive.ubuntu.com/ubuntu/dists/";
        this.distros = ["artful","bionic","cosmic","devel","disco",
                        "precise","trusty","xenial"];
        this.archs = ["amd64", "i386"];
        this.arcPrefix = "/main/binary-";
        this.fileToFetch = "Packages.gz";
    }
}

function promiseFromChildProcess(child) {
    return new Promise(function(resolve, reject) {
        child.addListener('error', reject);
        child.addListener('exit', resolve);
    });
}

function run(command) {
    let proc = exec(command);
    proc.stdout.on('data', function(stdout) {
        process.stdout.write(`${stdout}`);
      });
      proc.stderr.on('data', function(stderr) {
          process.stdout.write(`${stderr}`);
      });
      return promiseFromChildProcess(proc);
}

  async function runJsonConversion() {
    let files = fs.readdirSync(writeDir);
    let targetFiles = files.filter(function(file) {
        return path.extname(file).toLowerCase() === ".gz";
    });
    for (gzFile of targetFiles) {
        var jsonFilename = path.basename(gzFile,".gz");
        let destFile = `${writeDir}/${jsonFilename}.json`;
        if(!fs.existsSync(destFile)) {
            await run(`ruby packages2json.rb ${writeDir}/${gzFile} > ${destFile}`);
        }
    }
}
let rp = new RasbianPackages();
let up = new UbuntuPackages();
rp.fetchAllFiles();
up.fetchAllFiles();
//runJsonConversion();
