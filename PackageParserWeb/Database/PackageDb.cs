using System;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using PackageParserWeb.DataStructures.Models;

namespace PackageParserWeb.Database
{
    public class PackageDb : MongoDbBase
    {
        IMongoCollection<BsonDocument> m_Packagecollection;
        protected const string sDatabaseCollectionType = "PackagesDb";

        private static readonly Lazy<PackageDb> _mongoDbInstance = new Lazy<PackageDb>(() => new PackageDb());

        public static PackageDb Instance
        {
            get
            {
                return _mongoDbInstance.Value;
            }
        }

        private PackageDb() : base()
        {
            m_Packagecollection = m_database.GetCollection<BsonDocument>(sDatabaseCollectionType);
        }

        public void AddPackageAsync(PackageEntry package)
        {
            BsonDocument bd = package.ToBsonDocument();
            Console.WriteLine($"adding package: {package.Package}");
            m_Packagecollection.InsertOneAsync(bd);
            ObjectId id = bd["_id"].AsObjectId;
            Sha1Db.Instance.AddHashAsync(package.Sha1, id);
            Md5Db.Instance.AddHashAsync(package.Md5Sum, id);
            Sha256Db.Instance.AddHashAsync(package.Sha256, id);
        }

        public PackageEntry findPackageByFileName(string fileName) {
            var found = m_Packagecollection.FindAsync(HashExtentions.filterByFileName(fileName)).Result.FirstOrDefault();
            if (found != null)
            {
                return DatabaseExtentions<PackageEntryDb>.Deserialize(found);
            }
            return null;
        }

        public async Task<PackageEntry> findPackageByIdAsync(ObjectId id)
        {
            var found = await m_Packagecollection.FindAsync(HashExtentions.filterById(id)).Result.FirstOrDefaultAsync();
            if (found != null)
            {
                return DatabaseExtentions<PackageEntryDb>.Deserialize(found);
            }
            return null;

        }
    }
}
