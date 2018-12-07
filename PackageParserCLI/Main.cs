using System.IO;
using System.IO.Compression;

namespace PackageParserCLI
{
    /// <summary>
    /// static class 
    /// </summary>
    public static class MainClass
    {
        /// Main function that decompreses package files into a stream and invokes
        /// a write to the mongodb database.
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
