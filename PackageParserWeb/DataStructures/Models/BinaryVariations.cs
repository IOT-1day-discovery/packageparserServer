using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PackageParserWeb.DataStructures.Models
{
    public class iotBinary
    {
        public String filepath { get; set; }
        public String machine { get; set; }
        public String buildid_hashf { get; set; }
        public String linkage { get; set; }
        public String osversion { get; set; }
        public String stripped { get; set; }
        public String elftype { get; set; }
        public String buildid_hash { get; set; }
        public String interpreter { get; set; }
        public String abiversion { get; set; }
        public String osabi { get; set; }
        public String endian { get; set; }
        public String bits { get; set; }
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
