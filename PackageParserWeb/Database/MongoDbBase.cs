using System;
using MongoDB.Driver;
using MongoDB.Bson;
using PackageParserWeb.Main;

namespace PackageParserWeb.Database
{
    public abstract class MongoDbBase
    {
        protected static IMongoClient m_client;
        protected static IMongoDatabase m_database;
        protected bool bEnableDb;
        protected MongoDbBase()
        {
            m_client = new MongoClient(Config.sMongoConnection);
            m_database = m_client.GetDatabase(Config.sAppName);

            var pingTask = m_database.RunCommandAsync<BsonDocument>(new BsonDocument("ping", 1));
             pingTask.Wait(Config.timeout);
             if (pingTask.IsCompleted) {
                Console.WriteLine($"Connected to: {Config.sMongoConnection}");
            } else {
                throw new TimeoutException($"Failed to connect to: {Config.sMongoConnection}.");
            }
        }
    }
}
