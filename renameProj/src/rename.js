const fs = require('fs');
const util = require('util');
const JSONStream = require('JSONStream');

async function readAndWriteFileAsync(fileName) {
    const readFile = util.promisify(fs.readFile);
    let obj = {};
    try {
        obj = await readFile(fileName,'utf8');
        for (var prop in obj) {

            let  filePath = obj[prop].filepath;
            let lastIndexOfSlash = filepath.lastIndexOf('/');
            let binaryName = filepath.substring(lastIndexOfSlash +1);
            delete obj[prop];
            obj.binaryName = binaryName;
        }
    } catch (err) {
        console.error(err);
    }
    const writeFile = util.promisify(fs.writeFile);
    try {
        await writeFile(`output-${fileName}`, obj);
    } catch (err) {
        console.error(err);
    }
}


function ReadAndWriteStream(fileName) {
    let stream = fs.createReadStream(fileName);
    let outputStream = fs.createWriteStream(`${fileName}-output.json`);
    let transformStream = JSONStream.parse("$*");
    let transformWriteStream = JSONStream.stringify();
    transformStream.on('data', function (obj) {
        let arr = obj.value;
        for(let i = 0; i <arr.length;i++) {
            let filePath = arr[i].filepath;
            let lastIndexOfSlash = filePath.lastIndexOf('/');
            let binaryName = filePath.substring(lastIndexOfSlash +1);
            delete arr[i].filepath;
            arr[i].binaryName = binaryName;
        }
        let newObj = {};
        newObj[obj.key] = obj.value;
        transformWriteStream.write(newObj);
    })
    transformWriteStream.pipe( outputStream );
    inputStream = stream.pipe( transformStream );
}


ReadAndWriteStream("../FileSystemBinaries.json")