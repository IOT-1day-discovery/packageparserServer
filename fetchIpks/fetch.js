//'use strict';
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

async function writeChunk(filePath, writeArr) {
    const writeFile = utilPromisify(fs.writeFile);
    try {
        await writeFile(filePath, JSON.stringify(writeArr));
    } catch (err) {
        console.error(err);
        throw new Error('Failed to write to disk.');
    }
}

function writeStream(filePath, writeArr) {
    let outputStream = fs.createWriteStream(filePath);
    let transformWriteStream = JSONStream.stringify();
    transformWriteStream.pipe( outputStream );
    transformWriteStream.write(writeArr);
    transformWriteStream.end();
}

async function writeFile(fileName, writeArr, asStream=true) {
    let filePath = `cache/${fileName}-cache.json`;
    await mkDir(filePath);
    if(asStream) {
        writeStream(filePath, writeArr);
    } else {
        await writeChunk(filePath, writeArr);
    }
}

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

function attachPromise(stream) {
    return new Promise((resolve, reject) => {
        stream.on("finish", () => { resolve(true); }); 
        stream.on("error", reject);
    });
  }

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
async function downloadFileOld(url, bar) {
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
    //console.log(filePath);
    if (!fs.existsSync(filePath)) {
        let file = fs.createWriteStream(filePath);
        let filePromise = attachPromise(file);
        //let request = await httpGet(url, file);
        let request = http.get(url, function(response) {
            if(response.status < 400) { 
                response.pipe(file);
            }
        });
        let requestPromise = attachPromise(request);
        try {
            await requestPromise;
            request.end();
            await filePromise;
            file.end();
        } catch(e) {
            console.error(e);
        }
    }
    bar.increment(1);
}

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

function promiseFromChildProcess(child) {
    return new Promise(function(resolve, reject) {
        child.addListener('error', reject);
        child.addListener('exit', resolve);
    });
}

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
    returnObj.descriptors = ipkFile.split('/');
    //await run(`rm -rf ${extractedDir} `);
    //console.log(returnObj);
    return returnObj;
}

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
    filepaths = []
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

async function downloadAndComputeHashes() {
    await InvokeIpkDownload();
    //InvokeIpkDownload(['barrier_breaker/14.07/ramips/rt3883/packages/packages/']);
    walkAndComputeHashes();
}

downloadAndComputeHashes();
//extractIpk("ipks/barrier_breaker/14.07/ramips/perl-compress-bzip2_2.18-1_ramips_24kec.ipk");
