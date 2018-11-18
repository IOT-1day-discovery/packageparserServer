using System;
using Newtonsoft.Json.Linq;
using PackageParserWeb.DataStructures.Models;

namespace PackageParserWeb.Database
{
    public class Md5Db : HashDb
    {
        private static readonly Lazy<Md5Db> _mongoDbInstance = new Lazy<Md5Db>(() => new Md5Db());

        public static Md5Db Instance
        {
            get
            {
                return _mongoDbInstance.Value;
            }
        }
        protected override string sDatabaseCollectionType { get { return "Md5Db"; } }

        private Md5Db(){}

        public PackageEntry getPackageByMd5Hash(string md5Hash ) {
            return base.GetPackageByHash(md5Hash).Result;
        }
    }
}
