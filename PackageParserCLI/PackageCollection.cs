
using System;
using System.IO;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PackageParserWeb.DataStructures.Models;
using PackageParserWeb.Database;

namespace PackageParserCLI
{
    /// <summary>
    /// static class 
    /// </summary>
    public static class PackageStoreHelper
    {
        public delegate void AddPackage(PackageEntry pe);

        /// <summary>
        /// A function that takes a stream and writes to the mongodb database.
        /// </summary>
        public static void FromStreamToDb(Stream zip) {
            FromStream(zip, PackageDb.Instance.AddPackageAsync);
        }

        /// <summary>
        /// A function that takes a stream and writes to a list.
        /// used for debugging.
        /// </summary>
        ///<returns>
        /// returns the json serialized package as a string.
        ///</returns>
        public static string FromStreamToList(Stream zip) {
            List<PackageEntry> packages = new List<PackageEntry>();
            FromStream(zip, packages.Add);
            return JsonConvert.SerializeObject(packages.ToArray());
        }

        /// <summary>
        /// JSON parser for package.gz files.
        /// </summary>
        public static void FromStream(Stream zip, AddPackage funcAdd)
        {
            using (StreamReader unzip = new StreamReader(zip))
            {

                JObject currJsonObject = null;
                while (!unzip.EndOfStream)
                {
                    string line = unzip.ReadLine();
                    if(String.IsNullOrEmpty(line)) {
                        continue;
                    }
                    string[] attribute = line.Split(new char[] { ':'}, 2);
                    if(attribute.Length != 2) {
                        Console.Write("Error line: " + line + "\n could not be parsed.");
                        continue;
                    }
                    Console.WriteLine(line);
                    Console.WriteLine(attribute);
                    string key = attribute[0].Trim();
                    string value = attribute[1].Trim();
                    if (key.Equals("Package"))
                    {
                        if (currJsonObject != null)
                        {
                            funcAdd(JsonConvert.DeserializeObject<PackageEntry>(currJsonObject.ToString()));
                        }
                        currJsonObject = new JObject();
                    }
                    if (currJsonObject.GetValue(key) == null)
                    {
                        currJsonObject.Add(key, value);
                    }
                }
            }
        }
    }
}
