using System;
//using System.Globalization;
using Newtonsoft.Json;

namespace FindUniquePackages
{
    public class BinaryInfo
    {
        public readonly String filepath;
        [JsonIgnore]
        public readonly String machine;
        [JsonIgnore]
        public readonly String buildid_hashf;
        [JsonIgnore]
        public readonly String linkage;
        [JsonIgnore]
        public readonly String osversion;
        [JsonIgnore]
        public readonly String stripped;
        [JsonIgnore]
        public readonly String elftype;
        [JsonIgnore]
        public readonly String buildid_hash;
        [JsonIgnore]
        public readonly String interpreter;
        [JsonIgnore]
        public readonly String abiversion;
        [JsonIgnore]
        public readonly String osabi;
        [JsonIgnore]
        public readonly String endian;
        [JsonIgnore]
        public readonly String bits;
        [JsonProperty("sha1")]
        public readonly String file_sha1;
        public BinaryInfo(String[] initArr){
            filepath = initArr[0];
            machine = initArr[1];
            buildid_hashf = initArr[2];
            linkage = initArr[3];
            osversion = initArr[4];
            stripped = initArr[5];
            elftype = initArr[6];
            buildid_hash = initArr[7];
            interpreter = initArr[8];
            abiversion = initArr[9];
            osabi = initArr[10];
            endian = initArr[11];
            bits = initArr[12];
            file_sha1 = initArr[13];
        }

        public override int GetHashCode() {
            //return int.Parse(this.file_sha1, NumberStyles.HexNumber);
            return this.file_sha1.GetHashCode();
        }

        public override bool Equals(object obj)
        {
            return obj is BinaryInfo && (this.file_sha1 == ((BinaryInfo)obj).file_sha1);
        }
    }
}
