const http = require('http');
const https = require('https');
const fs = require('fs');
const zlib = require("zlib");
const path = require("path");
const exec = require('child_process').exec;

const writeDir = "compressedPackages";

/**
 * @class FetchPackages
 *  @description a base class that defines the scafolding for downloading and storing packages
 */
class FetchPackages {
    /**
     * @property {string} baseUrl -The base url where a package is located
     */

    /**
     * @property {string} arcPrefix- The specific archtecture you want to fetch.
     */

    /**
     * @property {string} fileToFetch- The specific file you want to fetch.
     */

    /**
     * @property {Boolean} shouldWriteToFile - boolean to determine if extracted file should be written.
     */

    /** 
     *  @property {http|https} httpImpl - specific http type to use.
     */
    /** 
     * @property {Array<string>} archs  architectures supported by distro.
     */
    /** 
     * @property {Array<string>} distros  codenames supported
     */

    /**
     * A function that contstructs the url.
     * @param {string} distro a string representing the distribution
     * @param {string} arch  a string representing the cpu architecture.
     * @return {string} the url we will download files from
     */
    urlConstructior(distro, arch) {
        return `${this.baseUrl}${distro}${this.arcPrefix}${arch}/${this.fileToFetch}`
    }

    /**
     * constructs the name of the file we will create.
     * @param {string} distro a string representing the distribution
     * @param {string} arch  a string representing the cpu architecture.
     */
    fileNameConstructor(distro, arch) {
        return `${distro}-${arch}`
    }

    /**
     * A function that sets up and http to write stream.
     * @param {string} fileName The name of the file to write to.
     * @param {string} url The URL to download from.
     */
    downloadFile(fileName, url) {
        if (!fs.existsSync(fileName)) {
            let file = fs.createWriteStream(fileName);
            let request = this.httpImpl.get(url, function(response) {
                response.pipe(file);
            });
        }
    }

    /**
     * A funtion that helps with the downloading of Package.gz files.
     * @param {string} distro a string representing the distribution
     */
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
    /**
     * Iterates through all distro and calls a helper to dowload specified files.
     */
    fetchAllFiles() {
        for (let distro of this.distros) {
            this.fetchAllFilesHelper(distro);
        }
    }

    /**
     * function to decompress zlib compressed files.
     * @param {string} tarballPath path the file we want to decompress
     * @param {string} dstPath path to where we want to write this file.
     */
    unzip(tarballPath, dstPath) {
        fs.createReadStream(tarballPath)
            .on('error', console.error)
            .pipe(zlib.Unzip())
            //.pipe(tar.Parse())
            .pipe(fs.createWriteStream(dstPath));
    }
}

/**
 * @class RasbianPackages
 *  @description a class that fetches rasbian package.gz files
 */
class RasbianPackages extends FetchPackages {
    /**
     * constructor for RasbianPackages
     */
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
    /**
     * override of fileNameConstructor adds rasbian specific prefix.
     * @param {string} distro a string representing the distribution
     * @param {string} arch  a string representing the cpu architecture.
     */
    fileNameConstructor(distro, arch) {
        return `raspbian-${super.fileNameConstructor(distro,arch)}`;
    }
}

/**
 * @class UbuntuPackages
 *  @description a class that fetches ubuntu package.gz files
 */
class UbuntuPackages extends FetchPackages {
    /**
     * constructor for UbuntuPackages
     */
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

/**
 * @class DebianPackages
 *  @description a class that fetches debian package.gz files
 */
class DebianPackages extends FetchPackages {
    /**
     * constructor for DebianPackages
     */
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
    /**
     * override fetchAllFiles w\o any supper calls to account for
     * different arch dependencies by distro version.
     */
    fetchAllFiles() {
        for (let distro of this.distros) {
            this.archs = this.archsByDistro[distro];
            //console.log(this.archs);
            super.fetchAllFilesHelper(distro);
        }
    }
}

/**
 * A function that attaches promise semantics to a child process api.
 * @param {child_process} child api that we want to convert the callback to a promise.
 */
function promiseFromChildProcess(child) {
    return new Promise(function(resolve, reject) {
        child.addListener('error', reject);
        child.addListener('exit', resolve);
    });
}

/**
 * A function for running shell commands like wget and tar.
 * @param {string} command we want to execute in a shell.
 */
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

/**
 * function that calls a ruby file that converts a package.gz file into a json file.
 */
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
