using System;
using Newtonsoft.Json.Linq;
using PackageParserWeb.DataStructures.Models;

namespace PackageParserWeb.Database
{
    public class Sha256Db : HashDb
    {
        private static readonly Lazy<Sha256Db> _mongoDbInstance = new Lazy<Sha256Db>(() => new Sha256Db());
        protected override string sDatabaseCollectionType { get { return "Sha256Db"; } }


        public static Sha256Db Instance
        {
            get
            {
                return _mongoDbInstance.Value;
            }
        }

        private Sha256Db() { }

        public PackageEntry getPackageBySha256Hash(string sha1Hash)
        {
            return base.GetPackageByHash(sha1Hash).Result;
            //return JObject.Parse(@"{'STATUS': 'TODO'}");
        }
    }
}
