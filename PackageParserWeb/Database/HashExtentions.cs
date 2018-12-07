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

        public static FilterDefinition<BsonDocument> filterByKey(string key)
        {
            var builder = Builders<BsonDocument>.Filter;

            return builder.Eq("k", key);
        }

        public static FilterDefinition<IpkInfoDb> filterBIpkByipkName(string ipkName)
        {
            var builder = Builders<IpkInfoDb>.Filter;
            return builder.ElemMatch(
                e => e.descriptors[4], 
                d => d.Equals(ipkName));
        }

        public static FilterDefinition<IpkInfoDb> filterBIpkBySha1(string sha1)
        {
            var builder = Builders<IpkInfoDb>.Filter;
            return builder.ElemMatch(
                e => e.files,
                f => f.sha1 == sha1);
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
