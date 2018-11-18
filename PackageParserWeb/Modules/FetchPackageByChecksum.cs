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
            Get["/md5/{hash}"] = parameters =>
            {
                string hash = parameters.hash;
                var package = Md5Db.Instance.getPackageByMd5Hash(hash);
                if (package != null) {
                    return Response.AsJson(package);
                }
                return Response.AsJson("{Entries: 0}");
            };
            Get["/sha1/{hash}"] = parameters =>
            {
                string hash = parameters.hash;
                var package = Sha1Db.Instance.getPackageBySha1Hash(hash);
                if (package != null) {
                    return Response.AsJson(package);
                }
                return Response.AsJson("{Entries: 0}");
            };
            Get["/sha256/{hash}"] = parameters =>
            {
                string hash = parameters.hash;
                var package = Sha256Db.Instance.getPackageBySha256Hash(hash);
                if(package != null) {
                    return Response.AsJson(package);
                }
                return Response.AsJson("{Entries: 0}");
            };
        }
    }
}
