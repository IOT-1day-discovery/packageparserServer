const http = require('http');
const https = require('https');
const fs = require('fs');
const zlib = require("zlib");
const path = require("path");
const exec = require('child_process').exec;

const writeDir = "compressedPackages";

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

    fetchAllFilesHelper(distro) {
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

    fetchAllFiles() {
        for (let distro of this.distros) {
            this.fetchAllFilesHelper(distro);
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

class DebianPackages extends FetchPackages {
    constructor() {
        super();
        this.shouldWriteToFile = false;
        this.httpImpl = http;
        this.baseUrl = "http://archive.debian.org/debian/dists/";
        this.distros = ["Debian-6.0","Debian-5.0","Debian-4.0",
                        "Debian-3.1", "Debian-3.0","Debian-2.2",
                        "Debian-2.1", "Debian-2.0","Debian-1.3.1",
                        "Debian-1.2", "Debian-1.1"

                       ];
        this.archsByDistro = { 
            "Debian-6.0": ["amd64", "i386", "armel", "ia64","mips","mipsel", "powerpc","s390", "sparc"],
            "Debian-5.0": ["amd64", "i386", "arm", "ia64","mips","mipsel", "powerpc","s390", "sparc"],
            "Debian-4.0": ["amd64", "i386", "arm", "ia64","mips","mipsel", "powerpc","s390", "sparc"],
            "Debian-3.1": ["i386", "arm", "ia64","mips","mipsel", "powerpc","s390", "sparc"],
            "Debian-3.0": ["i386", "arm", "ia64","mips","mipsel", "powerpc","s390", "sparc"],
            "Debian-2.2": ["i386", "arm", "powerpc","sparc"],
            "Debian-2.1": ["i386", "sparc"],
            "Debian-2.0": ["i386"],
            "Debian-1.3.1":["i386"],
            "Debian-1.2":["i386"],
            "Debian-1.1":["i386"]
                    };
        this.archs = [];
        this.arcPrefix = "/main/binary-";
        this.fileToFetch = "Packages.gz";
    }
    fetchAllFiles() {
        for (let distro of this.distros) {
            this.archs = this.archsByDistro[distro];
            //console.log(this.archs);
            super.fetchAllFilesHelper(distro);
        }
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
let dp = new DebianPackages();
rp.fetchAllFiles();
up.fetchAllFiles();
dp.fetchAllFiles();
//runJsonConversion();
