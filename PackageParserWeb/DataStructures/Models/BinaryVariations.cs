using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PackageParserWeb.DataStructures.Models
{
    public class iotBinary
    {
        public string filepath { get; set; }
        public string sha1 { get; set; }
    }

    public class BinaryVariationsDbEntry : BinaryVariations
    {
        [BsonId]
        public ObjectId _id { private get; set; }
        public ObjectId Id() { return _id; }
    }

    public class BinaryVariations
    {
        public string k { get; set; }
        public iotBinary[] v { get; set; }

    }
}
