using System;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using PackageParserWeb.DataStructures.Models;

namespace PackageParserWeb.Database
{
    public abstract class HashDb : MongoDbBase
    {
        protected IMongoCollection<BsonDocument> m_Hashcollection;
        abstract protected string sDatabaseCollectionType { get; }

        public HashDb() : base() {
            m_Hashcollection = m_database.GetCollection<BsonDocument>(sDatabaseCollectionType);
        }

        public void  AddHashAsync(string hash,ObjectId id) {

            BsonDocument bd = (new HashEntry() { hash = hash, PackageRef = id }).ToBsonDocument();
            m_Hashcollection.InsertOneAsync(bd);
        }

        public async Task<PackageEntry> GetPackageByHash(string hash) {

            var found = await m_Hashcollection.FindAsync(HashExtentions.filterByHash(hash)).Result.FirstOrDefaultAsync();
            if (found != null)
            {
                HashEntry he = DatabaseExtentions<HashEntry>.Deserialize(found);
                return await PackageDb.Instance.findPackageByIdAsync(he.PackageRef);
            }
            return null;
        }
    }
}
