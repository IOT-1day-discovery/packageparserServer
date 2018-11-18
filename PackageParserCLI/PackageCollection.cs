
using System;
using System.IO;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Linq;
using PackageParserWeb.DataStructures.Models;
using PackageParserWeb.Database;

namespace PackageParserCLI
{
    public static class PackageStoreHelper
    {
        public delegate void AddPackage(PackageEntry pe);

        public static void FromStreamToDb(Stream zip) {
            FromStream(zip, PackageDb.Instance.AddPackageAsync);
        }

        public static string FromStreamToList(Stream zip) {
            List<PackageEntry> packages = new List<PackageEntry>();
            FromStream(zip, packages.Add);
            return JsonConvert.SerializeObject(packages.ToArray());
        }

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
