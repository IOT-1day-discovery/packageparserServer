using System;
using Newtonsoft.Json.Linq;
using PackageParserWeb.DataStructures.Models;

namespace PackageParserWeb.Database
{
    public class Sha1Db : HashDb
    {
        private static readonly Lazy<Sha1Db> _mongoDbInstance = new Lazy<Sha1Db>(() => new Sha1Db());

        protected override string sDatabaseCollectionType { get { return "Sha1Db"; } }


        public static Sha1Db Instance
        {
            get
            {
                return _mongoDbInstance.Value;
            }
        }

        private Sha1Db() { }

        public PackageEntry getPackageBySha1Hash(string sha1Hash)
        {
            return base.GetPackageByHash(sha1Hash).Result;
        }
    }
}
