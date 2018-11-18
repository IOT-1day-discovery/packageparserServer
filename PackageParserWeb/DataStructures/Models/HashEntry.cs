using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PackageParserWeb.DataStructures.Models
{
    public class HashEntry
    {
        [BsonId]
        public ObjectId _id { get; set; }
        public string hash { get; set; }

        public ObjectId PackageRef  { get; set; }
    }
}
