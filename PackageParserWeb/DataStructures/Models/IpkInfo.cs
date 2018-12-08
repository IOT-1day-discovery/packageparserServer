using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PackageParserWeb.DataStructures.Models
{
    public class file {
        public string name { get; set; }
        public string sha1 { get; set; }
    }

    public class IpkInfoDb : IpkInfo
    {
        [BsonId]
        public ObjectId _id { private get; set; }
        public ObjectId Id() { return _id; }
    }

    public class IpkInfo
    {
        public file[] files  {get; set;}
        public string codeName  {get; set;}
        public string osVersion  {get; set;}
        public string arch  {get; set;}
        public string fileName  {get; set;}
        public string pkgSha1  {get; set;}
        public string pkgSha256  {get; set;}
        public string pkgmd5  {get; set;}
    }
}
