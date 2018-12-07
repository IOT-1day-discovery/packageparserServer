# IOT-1day-discovery:fetching files
## web crawling
please be courteous to the package repositories. Its really easy to get package explosion.
### Fetching ipks from http://archive.openwrt.org/
the archive has no api so we have to convert html tables to json in the fetchIpks package.
```json
[
    "attitude_adjustment/",
    "backfire/",
    "barrier_breaker/",
    "chaos_calmer/",
    "kamikaze/",
    "releases/",
    "snapshots/"
]
```
Above is an example of what one of the cache files will look like.
Each step of fetchIpks will take a exponentially longer time. which is why caching is so key to that project.
```
downloadAndComputeHashes- > InvokeIpkDownload -> InvokeIpkFetch -> InvokeArchTypes -> 
InvokeArchSetter -> InvokeVersionsSetter -> InvokeCodeNamesSetter
```
from *InvokeIpkFetch* to *InvokeCodeNamesSetter* we are just building up every combination of ipk links we need to download. *InvokeIpkDownload* actually downloads the files.
```
downloadAndComputeHashes- > walkAndComputeHashes -> extractIpk
```
*downloadAndComputeHashes*  uses *walkFs* to walk the filesystem hierarchy and generate a list of every ipk file
downloaded. Then we use extractIpk to decompress and then generate the hash of all the files inside the package.
an Ipk package has the following format:
```
data.tar.gz
control.tar.gz
```
At the end of the run you should see the following files in cache/
- codeNames-cache.json
- archOffsets-cache.json
- archTypes-cache.json
- versionTypes-cache.json
- ipks-cache.json
- ipksha1.json

*ipksha1.json* is imported into the mongodb database using:
-tools/importJsonToMdb.sh

### Fetching and parsing package.gz 
repos used:
- http://archive.debian.org/debian/dists/
- http://archive.openwrt.org/
- http://cz.archive.ubuntu.com/ubuntu/dists/
- https://archive.raspbian.org/raspbian/dists/

*fetchPackages.js* has been specialized for each of these distros to pull down package.gz  files.
While we are no longer using this for package retrieval, the version info stored within is very helpful
for retreiving version number in a reiliable fashion. something we need for the cve poriton of the project.
In any case PackageParserCLI has been written to decompress each package.gz fetched by fetchPackages.js parse them into a json and store them into the database.
