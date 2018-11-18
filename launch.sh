msbuild PackageParserWeb.sln /t:Clean
msbuild PackageParserWeb.sln /t:Rebuild /p:Configuration=Release
mkdir -p DbStore/data/db/
mongod --dbpath=DbStore/data/db/ &
mono PackageParserWeb/bin/Release/PackageParserWeb.exe

