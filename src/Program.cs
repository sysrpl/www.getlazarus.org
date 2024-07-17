using Codebot.Web;

namespace Lazarus;

public static class Program
{
    static bool CreateLinks()
    {
        var path = App.MapPath(App.RequestPath);
        if (path.Contains("image"))
            return false;
        if (path.Contains("forums"))
            return false;
        if (path.EndsWith('\\'))
            path = path.Remove(path.Length - 1);
        var filename = Path.GetFileName(path);
        if (filename.Contains('.'))
            return false;
        if (!Directory.Exists(path))
            Directory.CreateDirectory(path);
        filename = Path.Combine(path, "home.dchc");
        File.WriteAllText(filename, "Lazarus.HomePage, Lazarus");
        filename = Path.Combine(path, "home.html");
        if (!File.Exists(filename))
            File.WriteAllText(filename, "new page");
        filename = Path.Combine(path, "title.html");
        if (!File.Exists(filename))
            File.WriteAllText(filename, "Title");
        return true;
    }

    static void AppEndRequest(ContextEventArgs args)
    {
        if (App.StatusCode < 300)
            return;
        if (App.StatusCode == 404 && App.IsLocal && CreateLinks())
        {
            args.Context.Response.Redirect(App.RequestPath);
            return;
        }
        Console.WriteLine("Status Code: " + App.StatusCode);
        Console.WriteLine("  Request: " + App.RequestPath);
        Console.WriteLine("  Remote IP: " + App.IpAddress);
        Console.WriteLine("  User Agent: " + App.UserAgent);
    }

    public static void Main(string[] args)
    {
        App.OnEndRequest += AppEndRequest;
        App.Run(args);
    }
}
