using System;
namespace PackageParserWeb.Main
{
    public static class Config
    {
        public const string sMongoConnection = "mongodb://localhost:27017/";
        public const string sNancyHostConnect = "http://localhost:8080";
        public const string sAppName = "PackageParserWeb";
        public static TimeSpan timeout = new TimeSpan(0, 0, 5);
    }
}

