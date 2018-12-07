outputdir="outputdocs"
bindirD="bin/Debug"
mkdir "$outputdir"
#for filename in *.cs; do
#    mcs /reference:"$bindirD"/Newtonsoft.Json.dll /reference:"$bindirD"/SharpCompress.dll  "$filename" /doc:"$outputdir"/"$filename".xml
#done
mcs -pkg:dotnet /nowarn:1591 /reference:"$bindirD"/Newtonsoft.Json.dll /reference:"$bindirD"/SharpCompress.dll *.cs /doc:"$outputdir"/doc.xml
