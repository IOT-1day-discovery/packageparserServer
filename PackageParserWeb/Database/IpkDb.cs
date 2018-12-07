using System;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using PackageParserWeb.DataStructures.Models;

namespace PackageParserWeb.Database
{
    public class IpkDb : MongoDbBase
    {
        IMongoCollection<IpkInfoDb> m_Ipkcollection;
        protected const string sDatabaseCollectionType = "Ipksha1s";

        private static readonly Lazy<IpkDb> _mongoDbInstance = new Lazy<IpkDb>(() => new IpkDb());

        public static IpkDb Instance
        {
            get
            {
                return _mongoDbInstance.Value;
            }
        }

        private IpkDb() : base()
        {
            m_Ipkcollection = m_database.GetCollection<IpkInfoDb>(sDatabaseCollectionType);
        }

        public async Task<IpkInfoDb> findPackageByIpkNameAsync(string ipkName)
        {
            var found = await m_Ipkcollection.FindAsync(HashExtentions.filterBIpkByipkName(ipkName)).Result.FirstOrDefaultAsync();
            if (found != null)
            {
                return found;
            }
            return null;
        }

        public async Task<IpkInfoDb> findPackageBySha1Async(string sha1)
        {
            var found = await m_Ipkcollection.FindAsync(HashExtentions.filterBIpkBySha1(sha1)).Result.FirstOrDefaultAsync();
            if (found != null)
            {
                return found;
            }
            return null;
        }
    }
}