using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using PackageParserWeb.DataStructures.Models;

namespace PackageParserWeb.Database
{
    public static class HashExtentions
    {
        public static FilterDefinition<BsonDocument> filterByHash(string hash)
        {
            var builder = Builders<BsonDocument>.Filter;
            return builder.Eq("hash", hash);
        }

        public static FilterDefinition<BsonDocument> filterById(ObjectId id)
        {
            var builder = Builders<BsonDocument>.Filter;

            return builder.Eq("_id", id);
        }

        public static FilterDefinition<BsonDocument> filterById(this PackageEntryDb pe)
        {
            var builder = Builders<BsonDocument>.Filter;

            return builder.Eq("_id", pe.Id());
        }
    }

    public static class DatabaseExtentions<T>
    {
        public static T Deserialize(BsonDocument bd)
        {
            return BsonSerializer.Deserialize<T>(bd);
        }

        public static T[] DeserializeArray(BsonArray bArr)
        {

            return BsonSerializer.Deserialize<T[]>(bArr.ToJson());
        }
    }
}
