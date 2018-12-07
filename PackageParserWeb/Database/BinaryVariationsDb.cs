using System;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using PackageParserWeb.DataStructures.Models;

namespace PackageParserWeb.Database
{
    public class BinaryVariationsDb : MongoDbBase
    {
        IMongoCollection<BsonDocument> m_BinaryVaryCollection;
        protected const string sDatabaseCollectionType = "BinaryVariations";

        private static readonly Lazy<BinaryVariationsDb> _mongoDbInstance = new Lazy<BinaryVariationsDb>(() => new BinaryVariationsDb());

        public static BinaryVariationsDb Instance
        {
            get
            {
                return _mongoDbInstance.Value;
            }
        }

        private BinaryVariationsDb() : base()
        {
            m_BinaryVaryCollection = m_database.GetCollection<BsonDocument>(sDatabaseCollectionType);
        }

        public async Task<BinaryVariationsDbEntry> findBinaryByName(string name)
        {
            var found = await m_BinaryVaryCollection.FindAsync(HashExtentions.filterByKey(name)).Result.FirstOrDefaultAsync();
            if (found != null)
            {
                return DatabaseExtentions<BinaryVariationsDbEntry>.Deserialize(found);
            }
            return null;

        }
    }
}