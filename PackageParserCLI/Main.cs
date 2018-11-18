using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;

namespace PackageParserCLI
{
    public static class MainClass
    {
        public static void Main(string[] args) {

            string folderPath = Directory.GetCurrentDirectory() +
                                    @"/../../resources/compressedPackages";

            foreach (string file in Directory.EnumerateFiles(folderPath, "*.gz"))
            {
                var fs = File.OpenRead(file);
                using (Stream zipStream = new GZipStream(fs, CompressionMode.Decompress))
                {
                    PackageStoreHelper.FromStreamToDb(zipStream);
                }
            }
        }
    }
}
