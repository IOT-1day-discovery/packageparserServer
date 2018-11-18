using System;
using Nancy.Hosting.Self;
namespace PackageParserWeb.Main
{
    public static class MainClass
    {
        public static void Main(string[] args)
        {
            Nancy.StaticConfiguration.DisableErrorTraces = false;
            Nancy.Json.JsonSettings.RetainCasing = true;
            using (var host = new NancyHost(new Uri(Config.sNancyHostConnect)))
            {
                host.Start();
                Console.WriteLine($"Running on {Config.sNancyHostConnect}");
                string s = Console.ReadLine();
                while (s == null)
                {
                    s = Console.ReadLine();
                }
            }
        }
    }
}