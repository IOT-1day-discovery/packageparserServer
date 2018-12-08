'use strict';
const http = require('http');
const fs = require('fs');
const util = require('util');
const tabletojson = require('tabletojson');
const JSONStream = require('JSONStream');
const path = require('path');
const crypto = require('crypto');
const { spawn, exec }  = require('child_process');
const _cliProgress = require('cli-progress');
//const tar = require('tar-stream');
const  baseUrl = 'http://archive.openwrt.org/' 
const cacheFoundStr = "cache found for: "

/**
 * A function that reads in the table at the baseUrl for code names.
 * This function will cache results to codeNames-cache.json
 * @return {Array<string>} this function returns an array of codnames.
 */
async function InvokeCodeNamesSetter() {
    let fileName = "codeNames";
    let  codeNames = await readFile("codeNames");
    if(codeNames.length > 0) {
        console.log(`${cacheFoundStr}${fileName}`);
        return codeNames;
    }
    let setCodeNames = (tablesAsJson) =>{
        tablesAsJson[0].forEach(element => {
            let key = element['File Name'];
            if(key != 'whiterussian/') {
                codeNames.push(key);
            }
            
        });
    }
    await tabletojson.convertUrl(
        baseUrl, setCodeNames
    );
    await writeFile(fileName,codeNames);
    return codeNames;
}
/**
 * A function that reads in the table at the version url to produce a list of versions.
 * values are cached at versionTypes-cache.json.
 * @return {Array<string>} returns an array of version number offset addresses
 */
async function InvokeVersionsSetter() {
    let fileName = "versionTypes";
    let offSetUrls = await readFile(fileName);
    if(offSetUrls.length > 0) {
        return offSetUrls;
    }
    let  codeNames = await InvokeCodeNamesSetter();
    let i = 0
    let setVersions = (tablesAsJson) =>{
        tablesAsJson[0].forEach(element => {
            let key = element['File Name'];
            offSetUrls.push(codeNames[i]+key);
        });
    }
    for(; i < codeNames.length; i++) {
        let versionUrl = baseUrl+codeNames[i];
        await tabletojson.convertUrl(
            versionUrl, setVersions
        );
    }
    await writeFile(fileName,offSetUrls);
    return offSetUrls;
}

/**
 * This function builds up the architectures portion of our URL.
 * @param {Array<String>} filterArr this array reduces the architecures we will build url links for.
 * @return {Array<String>} returns the url list with arch included.
 */
async function InvokeArchSetter(filterArr) {
    let fileName = "archOffsets";
    let offSetUrls = await readFile(fileName);
    if(offSetUrls.length > 0) {
        console.log(`${cacheFoundStr}${fileName}`);
        return offSetUrls;
    }
    let  versionOffSetUrls = await InvokeVersionsSetter();
    let i = 0;
    let setArchs = (tablesAsJson) =>{
        let archs = [];
        tablesAsJson[0].forEach(element => {
            let key = element['File Name'];
            archs.push(key);
        });
        let filterArch = (arch) =>{
            let bFound = false;
            for(let j = 0; j < filterArr.length;j++) {
                bFound = arch.includes(filterArr[j]);
                if(bFound) {
                    break;
                }
            }
            return bFound;
        }
        archs  = archs.filter(filterArch);
        archs.forEach(element => {
            offSetUrls.push(versionOffSetUrls[i]+element);
        });
    }
    const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
    bar1.start(versionOffSetUrls.length, i);
    for(; i < versionOffSetUrls.length; i++) {
        let archUrl = baseUrl+versionOffSetUrls[i];
        await tabletojson.convertUrl(
            archUrl, setArchs
        );
        bar1.update(i);
    }
    bar1.stop();
    await writeFile(fileName,offSetUrls);
    return offSetUrls;
}

/**
 * Each Architecture can also have flavors so this invocation handles those.
 * @return {Array<String>} returns the url offset list that includes specific chipset info.
 */
async function InvokeArchTypes() {
    let fileName = "archTypes";
    let offSetUrls = await readFile(fileName);
    if(offSetUrls.length > 0) {
        console.log(`${cacheFoundStr}${fileName}`);
        return offSetUrls;
    }
    let archOffSetUrls = await InvokeArchSetter(["x86","mips"]);
    let i = 0;
    let setArchTypes = (tablesAsJson) =>{
        tablesAsJson[0].forEach(element => {
            let key = element['File Name'];
            if(key !=undefined) {
                offSetUrls.push(`${archOffSetUrls[i]}${key}packages/packages/`);
            } else {
                offSetUrls.push(`${archOffSetUrls[i]}packages/`);
            }
        });
    }

    const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
    bar1.start(archOffSetUrls.length, i);
    for(; i < archOffSetUrls.length; i++) {
        let archUrl = baseUrl+archOffSetUrls[i];
        //console.log(archUrl);
        await tabletojson.convertUrl(
            archUrl, setArchTypes
        );
        bar1.update(i);
    }
    bar1.stop();
    //console.log(offSetUrls);
    await writeFile(fileName,offSetUrls);
    return offSetUrls;
}
/**
 * A function that generates a list of every ipk file's url offset.
 * @param {Array<string>} fetchTheseIpks - if you know which ipks you want 
 * ahead of time you can specify it here and we won't build up a hierarchical list.
 * @return {Array<string>} returns a list of every ipk url offset in the hierarchy.
 * 
 */
async function InvokeIpkFetch(fetchTheseIpks=null) {
    let fileName = "ipks";
    let offSetUrls = [];
    let packageOffSetUrls;
    if(fetchTheseIpks == null) {
        offSetUrls = await readFile(fileName);
        if(offSetUrls.length > 0) {
            console.log(`${cacheFoundStr}${fileName}`);
            return offSetUrls;
        }
        packageOffSetUrls = await InvokeArchTypes();
    } else {
        packageOffSetUrls = fetchTheseIpks;
    }
    
    let i = 0;
    let getIpks = (tablesAsJson) =>{
        let files = [];
        if(tablesAsJson.length< 1) {
            return;
        }
        tablesAsJson[0].forEach(element => {
            let key = element['File Name'];
            files.push(key);
        });
        let filterIpks = (file) => {
            return file.endsWith(".ipk");
        }
        files  = files.filter(filterIpks);
        files.forEach(element => {
            offSetUrls.push(packageOffSetUrls[i]+element);
        });
    }

    const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
    bar1.start(packageOffSetUrls.length, i);
    for(; i < packageOffSetUrls.length; i++) {
        let packageUrl = baseUrl+packageOffSetUrls[i];
        await tabletojson.convertUrl(
            packageUrl, getIpks
        );
        bar1.update(i);
    }
    bar1.stop();
    //console.log(offSetUrls);
    await writeFile(fileName,offSetUrls);
    return offSetUrls;
}
/**
 * a function that will create a directory one up from the given path.
 * @param {string} filePath pass in a path to a file. we will make the directory
 *  one-level up.
 */
async function mkDir(filePath) {
    let dirPath = `./${path.dirname(filePath)}`;
    if (!fs.existsSync(dirPath)) {
        try {
            const pMkdir = util.promisify(fs.mkdir);
            await pMkdir(dirPath, { recursive: true});
        } catch (err) {
            console.error(err);
            //throw new Error('failed to make parent diectory');
        }
    }
}
/**
 * A function that writes to a file.
 * @param {string} filePath path to write file.
 * @param {Array} writeArr array we will serialize to JSON.
 */
async function writeChunk(filePath, writeArr) {
    const writeFile = utilPromisify(fs.writeFile);
    try {
        await writeFile(filePath, JSON.stringify(writeArr));
    } catch (err) {
        console.error(err);
        throw new Error('Failed to write to disk.');
    }
}
/**
 * A streamable write and json serialization function.
 * @param {string} filePath path to write file.
 * @param {Array} writeArr array we will serialize to JSON.
 */
function writeStream(filePath, writeArr) {
    let outputStream = fs.createWriteStream(filePath);
    let transformWriteStream = JSONStream.stringify();
    transformWriteStream.pipe( outputStream );
    transformWriteStream.write(writeArr);
    transformWriteStream.end();
}
/**
 * 
 * @param {string} filePath path to write file.
 * @param {Array} writeArr array we will serialize to JSON.
 * @param {Boolean} asStream Toggle between streamable and non streamable writes.
 */
async function writeFile(fileName, writeArr, asStream=true) {
    let filePath = `cache/${fileName}-cache.json`;
    await mkDir(filePath);
    if(asStream) {
        writeStream(filePath, writeArr);
    } else {
        await writeChunk(filePath, writeArr);
    }
}

/**
 * A function to read in json arrays
 * @param {string} fileName the path to a json file.
 * @return {Object} Returns the parsed json file. 
 *  Most use cases will return an Array<String>
 */
async function readFile(fileName) {
    const readFile = util.promisify(fs.readFile);
    let fileBytes = null;
    try {
        let filePath = `cache/${fileName}-cache.json`;
        fileBytes = await readFile(filePath);
    } catch (err) {
        console.error(err);
        return [];
    }
    return JSON.parse(fileBytes);
}

/**
 * A helper function to download files.
 * @param {string} url we want to download a file from.
 * @param {_cliProgress.Bar} bar progress bar that will update based on download perf.
 */
async function downloadFile(url, bar) {
    let parts = url.substring(baseUrl.length).split('/');
    let fileName = parts[parts.length-1];
    let codeName =  parts[0];
    let version  =  parts[1];
    let arch     =  parts[2];
    let filePath = `ipks/${codeName}/${version}/${arch}/${fileName}`;
    try {
        await mkDir(filePath);
    } catch(e) {
        console.error(e);
    }
    if (!fs.existsSync(filePath)) {
        await run(`wget ${url} -O ${filePath}`,[]);
    }
    bar.increment(1);
}

/**
 * A function that downloads the ipk files you either requested or the web crawler built up.
 * @param {Array<string>} fetchTheseIpks if you know which ipks you want ahead of time
 *  you can specify it here and we won't build up a hierarchical list.
 */
async function InvokeIpkDownload(fetchTheseIpks=null) {
    let ipkFiles;
    if(Array.isArray(fetchTheseIpks)){
        ipkFiles = await InvokeIpkFetch(fetchTheseIpks);
    } else {
        ipkFiles = await InvokeIpkFetch();
    }
    const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
    bar1.start(ipkFiles.length, 0);
    // using .exec wget forces small chunks to avoid
    // platform-specific pipe capacity
    let i,j,ipkFilesChunk,chunk = 40;
    for (i=0,j=ipkFiles.length; i<j; i+=chunk) {

        ipkFilesChunk = ipkFiles.slice(i,i+chunk);
        try {
        await Promise.all(ipkFilesChunk.map((ipkFile) => {
            let ipkUrl = baseUrl+ipkFile
            return downloadFile(ipkUrl, bar1);;
        }));
        } catch(e) {
            console.error(e);
        }
    }
    bar1.stop();
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
 * @param {Array<string>} outArr where we want to store the output of the command we invoked.
 */
function run(command,outArr=null) {
    let proc = exec(command);
    if(proc.stdout == undefined) {
        console.log(proc);
        while(true) {}
    }
    proc.stdout.on('data', function(stdout) { 
        let strStdOut = `${stdout}`;
        if(outArr !=null) {
            let lastIndexOfSlash = strStdOut.lastIndexOf('/');
            let fileName = strStdOut.substring(lastIndexOfSlash +1);
            if(fileName.length !=0 && fileName.length != 1) {
                outArr.push(strStdOut.substring(strStdOut.indexOf('./')+1).replace(/\n|\r/g, ""));
            }
        } else {
            process.stdout.write(strStdOut);
        }
      });

      proc.stderr.on('data', function(stderr) {
        let strStdErr = `${stderr}`;
        if(outArr !=null) {
            let lastIndexOfSlash = strStdErr.lastIndexOf('/');
            let fileName = strStdErr.substring(lastIndexOfSlash +1);
            if(fileName.length !=0 && fileName.length != 1 ) {
                outArr.push(strStdErr.substring(strStdErr.lastIndexOf('./')+1).replace(/\n|\r/g, ""));
            }
        } else {
          process.stdout.write(`${stderr}`);
        }
      });
      return promiseFromChildProcess(proc);
}

/*
async function removeZeroByteFilesMac() {
    await run(`find . -type f -size 0 -exec rm -f '{}' +`);
}*/

/**
 * A function to generate checksums on files.
 * @param {string} algorithm The algorithm is dependent on the available algorithms supported by the version of OpenSSL on the platform. 
 * @param {*} path the file we want to generate a checksum for.
 */
function checksumFile(algorithm, path) {
    return new Promise((resolve, reject) =>
      fs.createReadStream(path)
        .on('error', reject)
        .pipe(crypto.createHash(algorithm)
          .setEncoding('hex'))
        .once('finish', function () {
          resolve(this.read())
        })
    )
}

/**
 * A function that ill extract an ipk and hash its binary hierarchy. 
 * @param {string} ipkFile The ipk file we want to extract.
 */
async function extractIpk(ipkFile) {
    let lastIndexOfSlash = ipkFile.lastIndexOf('/');
    let fileName = ipkFile.substring(lastIndexOfSlash +1,ipkFile.length-5);
    let extractedDir = `extracted/extracted-${fileName}`;
    await mkDir(extractedDir+"/test.txt");
    await run(`tar zxpvf ${ipkFile} -C ${extractedDir}`,[]);
    let p1OutArray = [];
    let p2OutArray = [];
    let p1 = run(`tar xvzf ${extractedDir}/data.tar.gz -C ${extractedDir}`, p1OutArray);
    let p2 = run(`tar xvzf ${extractedDir}/control.tar.gz -C ${extractedDir}`,p2OutArray);
    await Promise.all([p1,p2]);
    //console.log(p1OutArray);
    //console.log(p2OutArray);
    let filesToHash = p1OutArray.concat(p2OutArray);
    let hashes = [];
    try {
        hashes = await Promise.all(filesToHash.map((fileOffset) => {
            let filePath = extractedDir + fileOffset;
            return checksumFile('sha1',filePath);
        }));
    } catch(e) {
        return {};
    }

    //console.log(filesToHash);
    //console.log(hashes);
    let returnObj = {};
    returnObj.files = [];
    for(let i = 0; i < filesToHash.length; i++) {
        let file = {};
        file.name = filesToHash[i];
        file.sha1 = hashes[i];
        returnObj.files[i] = file;
    }
    let descriptors = ipkFile.split('/');
    returnObj.codeName =descriptors[1];
    returnObj.osVersion =descriptors[2];
    returnObj.arch = descriptors[3];
    returnObj.fileName = descriptors[4];
    returnObj.pkgSha1 = await checksumFile('sha1',ipkFile);
    returnObj.pkgSha256 = await checksumFile('sha256',ipkFile);
    returnObj.pkgmd5 = await checksumFile('md5',ipkFile);
    //await run(`rm -rf ${extractedDir} `);
    //console.log(returnObj);
    return returnObj;
}
/**
 * A function that invokes a filesystem walk of downloaded ipks.
 * Then extracts the ipks and computes the sha1 hash of each binary.
 * Bars will show your progress from walking the filesystem to extracting files
 * to finally write out a json file that can be imported into mongodb.
 */
async function walkAndComputeHashes() {
    const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
    const bar2 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
    const bar3 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
    let outputArr = []
    await run("wc -l cache/ipks-cache.json", outputArr);
    let numOfValues = parseInt(outputArr[0])-1;
    bar1.start(numOfValues, 0);
    let filePath = `cache/ipksha1.json`;
    let outputStream = fs.createWriteStream(filePath);
    let transformWriteStream = JSONStream.stringify();
    transformWriteStream.pipe( outputStream );
    let countFail = 0;
    let countSucceed = 0;
    let hashobj = null;
    let filepaths = []
    let actionLambda = (ipkFilePath) => {
        filepaths.push(ipkFilePath);
        bar1.increment(1);
    }
    walkFs('ipks/',actionLambda);
    bar1.stop();
    bar2.start(filepaths.length, 0);
    let hashobjs = [];
    let i,j,ipkPathsChunk,chunk = 4;
    for (i=0,j=filepaths.length; i<j; i+=chunk) {
        //console.log(i);
        ipkPathsChunk = filepaths.slice(i,i+chunk);
        try {
            let hashobjsPart = await Promise.all(ipkPathsChunk.map((filepath) => {
                return extractIpk(filepath);
            }));
            hashobjs = hashobjs.concat(hashobjsPart);
        } catch(e) {
            console.log(e);
        }
        bar2.increment(chunk);
    }
    bar2.stop();
    bar3.start(hashobjs.length, 0);
    try {
        await Promise.all(hashobjs.map(async (hashobj) => {
            transformWriteStream.write(hashobj);
            bar3.increment(1);
        }));
    } catch(e) {
        console.log(e);
    }
    bar3.stop();
    transformWriteStream.end();
}

/**
 * A recursive function that walks the directory.
 * @param {string} dir directory we want to walk.
 * @param {Function} actionFunc function we want to run on each file found.
 * @param {Array} filelist an ouput parameter of the entire file hierarchy
 *  of the given directory to start walking at.
 * @return {Array} returns the files found at a particular directory level.
 * Intent was for this to only be used by the filesystem walk.
 */
const walkFs = (dir, actionFunc=null, filelist = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const dirFile = path.join(dir, file);
      const dirent = fs.statSync(dirFile);
      if (dirent.isDirectory()) {
        //console.log('directory', path.join(dir, file));
        var odir = {
          file: dirFile,
          files: []
        }
        odir.files = walkFs(dirFile, actionFunc, dir.files);
        filelist.push(odir);
      } else {
        if(dirFile.substring(dirFile.lastIndexOf('.') + 1) =="ipk") {
            //console.log(typeof actionFunc);
            if(actionFunc !=null) {
                actionFunc(dirFile);
            }
            filelist.push({
              file: dirFile
            });
        }
      }
    }
    return filelist;
  };

/**
 * Entrypoint for fetch.js
 */
async function downloadAndComputeHashes() {
    //await InvokeIpkDownload();
    await InvokeIpkDownload(['barrier_breaker/14.07/ramips/rt288x/packages/packages/']);
    walkAndComputeHashes();
}

downloadAndComputeHashes();
//extractIpk("ipks/barrier_breaker/14.07/ramips/perl-compress-bzip2_2.18-1_ramips_24kec.ipk");
