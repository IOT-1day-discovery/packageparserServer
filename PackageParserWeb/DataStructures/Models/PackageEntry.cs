using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
namespace PackageParserWeb.DataStructures.Models
{
    public class PackageEntryDb : PackageEntry
    {
        [BsonId]
        public ObjectId _id { private get; set; }
        public ObjectId Id() { return _id; }
    }

    public  class PackageEntry
    {
        [JsonProperty("Package")]
        public string Package { get; set; }

        [JsonProperty("Architecture")]
        public string Architecture { get; set; }

        [JsonProperty("Version")]
        public string Version { get; set; }

        [JsonProperty("Priority")]
        public string Priority { get; set; }

        [JsonProperty("Section")]
        public string Section { get; set; }

        [JsonProperty("Origin")]
        public string Origin { get; set; }

        [JsonProperty("Maintainer")]
        public string Maintainer { get; set; }

        [JsonProperty("Original-Maintainer")]
        public string OriginalMaintainer { get; set; }

        [JsonProperty("Bugs")]
        public String Bugs { get; set; }

        [JsonProperty("Installed-Size")]
        public long InstalledSize { get; set; }

        [JsonProperty("Depends")]
        public string Depends { get; set; }

        [JsonProperty("Filename")]
        public string Filename { get; set; }

        [JsonProperty("Size")]
        public long Size { get; set; }

        [JsonProperty("MD5sum")]
        public string Md5Sum { get; set; }

        [JsonProperty("SHA1")]
        public string Sha1 { get; set; }

        [JsonProperty("SHA256")]
        public string Sha256 { get; set; }

        [JsonProperty("Homepage")]
        public String Homepage { get; set; }

        [JsonProperty("Description")]
        public string Description { get; set; }

        [JsonProperty("Description-md5")]
        public string DescriptionMd5 { get; set; }

        [JsonProperty("Supported")]
        public string Supported { get; set; }

        [JsonProperty("Build-Ids")]
        public string BuildIds { get; set; }

    }
}
