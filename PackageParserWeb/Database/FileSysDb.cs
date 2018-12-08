using System;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using PackageParserWeb.DataStructures.Models;

namespace PackageParserWeb.Database
{
    public class FileSysDb : MongoDbBase
    {
        IMongoCollection<BsonDocument> m_BinaryVaryCollection;
        protected const string sDatabaseCollectionType = "FileSystemBinaries";

        private static readonly Lazy<FileSysDb> _mongoDbInstance = new Lazy<FileSysDb>(() => new FileSysDb());

        public static FileSysDb Instance
        {
            get
            {
                return _mongoDbInstance.Value;
            }
        }

        private FileSysDb() : base()
        {
            m_BinaryVaryCollection = m_database.GetCollection<BsonDocument>(sDatabaseCollectionType);
        }

        public async Task<BinaryVariationsDbEntry> findFileSystemByKey(string key)
        {
            var found = await m_BinaryVaryCollection.FindAsync(HashExtentions.filterByKey(key));
            if (found != null)
            {
                return DatabaseExtentions<BinaryVariationsDbEntry>.Deserialize(found.FirstOrDefault());
            }
            return null;

        }
    }
}