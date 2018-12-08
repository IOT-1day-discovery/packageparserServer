using System;
using System.Collections.Generic;
using System.IO;
using SharpCompress.Compressors.Xz;
using Newtonsoft.Json;
using System.Linq;
using System.Collections;

namespace FindUniquePackages
{
    /// <summary>
    /// static class 
    /// </summary>
    public static class Program
    {
        static Dictionary<string, List<BinaryInfo>> filesystemToBinaryInfo = new Dictionary<string, List<BinaryInfo>>();
        static Dictionary<string, HashSet<BinaryInfo>> binaryNameToBinaryInfo = new Dictionary<string, HashSet<BinaryInfo>>();
        //static HashSet<BinaryInfo> binarySet = new HashSet<BinaryInfo>();

        /// <summary>
        /// builds a file system map to its binaries. 
        /// </summary>
        public static void addToFileSystemMap(BinaryInfo bi)
        {
            List<BinaryInfo> binaries;
            if (filesystemToBinaryInfo.TryGetValue(bi.keyValue, out binaries))
            {
                binaries.Add(bi);
            }
            else
            {
                binaries = new List<BinaryInfo>() { bi };
                filesystemToBinaryInfo.Add(bi.keyValue, binaries);
            }
        }

        /// <summary>
        /// builds a similarity matrix of  filesystems.
        /// NOTE: don't use  when too many filesystems
        /// </summary>
        /// <returns>
        /// returns the json serialized version of the matrix.
        /// </returns>
        public static string generateSimilarityMatrix() {

            double[,] similarityMat = new double[filesystemToBinaryInfo.Count,filesystemToBinaryInfo.Count];
            int i = 0;
            foreach (KeyValuePair<string, List<BinaryInfo>> entry in filesystemToBinaryInfo)
            {
                int j = 0;
                foreach (KeyValuePair<string, List<BinaryInfo>> entry2 in filesystemToBinaryInfo){
                    if(entry.Key == entry2.Key) {
                        continue;
                    }
                    if (i <= j)
                    {
                        int foundCount = 0;
                        int k = 0;
                        for (; k < entry.Value.Count; k++)
                        {
                            if (entry2.Value.Contains(entry.Value[k]))
                            {
                                foundCount++;
                            }
                        }
                        double currentSimilarityScore = foundCount / (double)k;
                        similarityMat[i, j] = currentSimilarityScore;
                    }
                    j++;
                }
                i++;
            }

            return JsonConvert.SerializeObject(similarityMat);
        }

        /// <summary>
        /// specialized add for binaryNameToBinaryInfo.
        /// </summary>
        public static void addToBinaryNameMap(BinaryInfo bi)
        {
            int lastIndexOfSlash = bi.filepath.LastIndexOf('/');
            string binaryName = bi.filepath.Substring(lastIndexOfSlash +1);
            HashSet<BinaryInfo> binaries;
            if (binaryNameToBinaryInfo.TryGetValue(binaryName, out binaries))
            {
                binaries.Add(bi);
            }
            else
            {
                binaries = new HashSet<BinaryInfo>() { bi };
                binaryNameToBinaryInfo.Add(binaryName, binaries);
            }
        }

        /// <summary>
        /// The needed serialization transform to have named key and value types.
        /// </summary>
        /// <return>
        /// returns an enumerable type conversion of a Dictionary.
        /// </return>
        public static IEnumerable serializationTransform<K,V>(Dictionary<K,V> aDict) {
            return from key in aDict.Keys
                                    select new { k = key, v = aDict[key] };
        }

        public static void streamReadHelper(StreamReader rStream) {
            string line = rStream.ReadLine();
            if (String.IsNullOrEmpty(line))
            {
                return;
            }
            if (line.StartsWith("filepath"))
            {
                return;
            }
            string[] lines = line.Split(';');
            BinaryInfo bi = new BinaryInfo(lines);
            //binarySet.Add(bi);
            addToFileSystemMap(bi);
            addToBinaryNameMap(bi);
        }


        /// Main function that decompresses a xz file and serialized it 
        // into a json for mongodb storage.
        public static void Main(string[] args)
        {
            if (args.Length != 1)
            {
                Console.Write("syntax is ./FundUniquePackages.exe <file>.xz");
                return;
            }
            var fs = File.OpenRead(args[0]);
            if (fs.Name.EndsWith(".xz"))
            {
                using (Stream zipStream = new XZStream(fs))
                {
                    using (StreamReader unzip = new StreamReader(zipStream))
                    {
                        while (!unzip.EndOfStream)
                        {
                            streamReadHelper(unzip);
                        }
                    }
                }
            } else {
                using (StreamReader fsStream = new StreamReader(fs))
                {
                    while (!fsStream.EndOfStream)
                    {
                        streamReadHelper(fsStream);
                    }
                }
            }
            File.WriteAllText("FileSystemBinaries.json", JsonConvert.SerializeObject(serializationTransform(filesystemToBinaryInfo)));
            File.WriteAllText("BinaryVariations.json", JsonConvert.SerializeObject(serializationTransform(binaryNameToBinaryInfo)));
            //File.WriteAllText("SimilarityArray.json", generateSimilarityMatrix());
        }
    }
}
