using System;
using System.Collections.Generic;
using System.IO;
using SharpCompress.Compressors.Xz;
using Newtonsoft.Json;

namespace FindUniquePackages
{
    public static class Program
    {
        static Dictionary<string, List<BinaryInfo>> filesystemToBinaryInfo = new Dictionary<string, List<BinaryInfo>>();
        static Dictionary<string, HashSet<BinaryInfo>> binaryNameToBinaryInfo = new Dictionary<string, HashSet<BinaryInfo>>();
        //static HashSet<BinaryInfo> binarySet = new HashSet<BinaryInfo>();

        public static void addToFileSystemMap(BinaryInfo bi)
        {
            int indexOfSlash = bi.filepath.IndexOf('/');
            int indexOfDot = bi.filepath.IndexOf('.');
            int endIndex = indexOfDot;
            int delataDist = (endIndex - indexOfSlash) - 1;
            if (indexOfDot == -1 || delataDist > 41) {
                endIndex = bi.filepath.IndexOf('/', indexOfSlash + 1);
            }
            string fileSystemName = bi.filepath.Substring(indexOfSlash+1, (endIndex - indexOfSlash)-1);
            fileSystemName = fileSystemName.TrimStart('_');
            List<BinaryInfo> binaries;
            if (filesystemToBinaryInfo.TryGetValue(fileSystemName, out binaries))
            {
                binaries.Add(bi);
            }
            else
            {
                binaries = new List<BinaryInfo>() { bi };
                filesystemToBinaryInfo.Add(fileSystemName, binaries);
            }
        }

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

        public static void Main(string[] args)
        {
            if (args.Length != 1)
            {
                Console.Write("syntax is ./FundUniquePackages.exe <file>.xz");
            }
            var fs = File.OpenRead(args[0]);
            using (Stream zipStream = new XZStream(fs))
            {
                using (StreamReader unzip = new StreamReader(zipStream))
                {
                    while (!unzip.EndOfStream)
                    {
                        string line = unzip.ReadLine();
                        if (String.IsNullOrEmpty(line))
                        {
                            continue;
                        }
                        if(line.StartsWith("filepath")) {
                            continue;
                        }
                        string[] lines = line.Split(';');
                        BinaryInfo bi = new BinaryInfo(lines);
                        //binarySet.Add(bi);
                        addToFileSystemMap(bi);
                        addToBinaryNameMap(bi);
                    }
                }
            }
            File.WriteAllText("FileSystemBinaries.json", JsonConvert.SerializeObject(filesystemToBinaryInfo));
            //File.WriteAllText("BinaryVariations.json", JsonConvert.SerializeObject(binaryNameToBinaryInfo));
            //File.WriteAllText("SimilarityArray.json", generateSimilarityMatrix());
        }
    }
}
