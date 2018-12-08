using System;
//using System.Globalization;
using Newtonsoft.Json;

namespace FindUniquePackages
{
    /// <summary>
    /// An object representation of what we fetch from a csv
    /// and then serialize to json for mongodb importation.
    /// </summary>
    public class BinaryInfo
    {
        [JsonIgnore]
        public readonly String keyValue;
        public readonly String filepath;
        public readonly String machine;
        public readonly String buildid_hashf;
        public readonly String linkage;
        public readonly String osversion;
        public readonly String stripped;
        public readonly String elftype;
        public readonly String buildid_hash;
        public readonly String interpreter;
        public readonly String abiversion;
        public readonly String osabi;
        public readonly String endian;
        public readonly String bits;
        [JsonProperty("sha1")]
        public readonly String file_sha1;

        /// <summary>
        /// constructor for BinaryInfo
        /// </summary>
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
            keyValue = initArr[14];
        }
        /// <summary>
        /// a hashcode override that uses the sha1 string.
        /// </summary>
        /// <returns>
        /// the hashcode of the sha1 string.
        /// </returns>
        public override int GetHashCode() {
            //return int.Parse(this.file_sha1, NumberStyles.HexNumber);
            return this.file_sha1.GetHashCode();
        }
        /// <summary>
        /// a Equals override that checks equality of sha1 strings
        /// </summary>
        /// <returns>
        /// the boolean evaluation of sha1 comparisons
        /// </returns>
        public override bool Equals(object obj)
        {
            return obj is BinaryInfo && (this.file_sha1 == ((BinaryInfo)obj).file_sha1);
        }
    }
}
