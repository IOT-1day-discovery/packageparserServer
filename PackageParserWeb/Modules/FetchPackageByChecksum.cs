using System;
using Nancy;
using Nancy.ModelBinding;
using PackageParserWeb.Database;
using PackageParserWeb.DataStructures.Models;

namespace PackageParserWeb.Modules
{
    public class FetchPackageByChecksum : NancyModule
    {
        public FetchPackageByChecksum()
        {
            Get["package/md5/{hash}"] = parameters =>
            {
                string hash = parameters.hash;
                var package = Md5Db.Instance.getPackageByMd5Hash(hash);
                if (package != null) {
                    return Response.AsJson(package);
                }
                return Response.AsJson("{Entries: 0}");
            };
            Get["package/sha1/{hash}"] = parameters =>
            {
                string hash = parameters.hash;
                var package = Sha1Db.Instance.getPackageBySha1Hash(hash);
                if (package != null) {
                    return Response.AsJson(package);
                }
                return Response.AsJson("{Entries: 0}");
            };
            Get["package/sha256/{hash}"] = parameters =>
            {
                string hash = parameters.hash;
                var package = Sha256Db.Instance.getPackageBySha256Hash(hash);
                if(package != null) {
                    return Response.AsJson(package);
                }
                return Response.AsJson("{Entries: 0}");
            };

            Get["binary/ipkNames/{ipkName}"] = parameters =>
            {
                string ipkName = parameters.ipkName;
                try
                {
                    var ipk = IpkDb.Instance.findPackageByIpkNameAsync(ipkName);
                    if (ipk != null)
                    {
                        return Response.AsJson(ipk);
                    }
                } catch (Exception e)
                {
                    Console.WriteLine(e);
                }
                return Response.AsJson("{Entries: 0}");
            };

            Get["binary/ipks/sha1/{hash}"] = parameters =>
            {
                string hash = parameters.hash;
                try
                {
                    var ipk = IpkDb.Instance.findPackageBySha1Async(hash);
                    if (ipk != null)
                    {
                        return Response.AsJson(ipk);
                    }
                } catch(Exception e) {
                    Console.WriteLine(e);
                }
                return Response.AsJson("{Entries: 0}");
            };
            Get["binary/iot/names/{name}"] = parameters =>
            {
                string name = parameters.name;
                try{
                    var binaries = BinaryVariationsDb.Instance.findBinaryByName(name);
                    if (binaries != null)
                    {
                        return Response.AsJson(binaries);
                    }
                }catch (Exception e)
                {
                    Console.WriteLine(e);
                }
                return Response.AsJson("{Entries: 0}");
            };
        }
    }
}
