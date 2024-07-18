using Codebot.Web;

namespace Lazarus;

[DefaultPage("/Templates/home.html", IsTemplate = true)]
public class HomePage : PageHandler
{
    #region Editor support

    [Action("render-editor")]
    public void ActionEdit() => Include("/Templates/edit.html", true);

    [Action("read-title")]
    public void ActionReadTitle() => Write(Title);

    [Action("read-content")]
    public void ActionReadContent() => Write(Content);

    [Action("read-original")]
    public void ActionReadOriginal()
    {
        if (FileExists("home.html"))
            Write(IncludeRead("home.html"));
        else
            Write("<h1>Empty Content</h1>");
    }

    [Action("save-title")]
    public void ActionSaveTitle() => FileWriteText(EditedTitleName, ReadBody());

    [Action("save-content")]
    public void ActionSaveContent() => FileWriteText(EditedContentName, HtmlUnescape(ReadBody()));

    [Action("delete-edits")]
    public void ActionDeleteEdits()
    {
        if (FileExists(EditedTitleName))
            FileDelete(EditedTitleName);
        if (FileExists(EditedContentName))
            FileDelete(EditedContentName);
    }

    [Action("apply-title")]
    public void ActionApplyTitle()
    {
        FileWriteText("title.html", Title);
        if (FileExists(EditedTitleName))
        {
            var f = $"history.title.{DateTime.Now:yyyyMMddHHmmss)}.html";
            FileWriteText(f, FileReadText(EditedTitleName));
            FileDelete(EditedTitleName);
        }
    }

    [Action("apply-content")]
    public void ActionApplyContent()
    {
        FileWriteText("home.html", Content);
        if (FileExists(EditedContentName))
        {
            var f = $"history.home.{DateTime.Now:yyyyMMddHHmmss)}.html";
            FileWriteText(f, FileReadText(EditedContentName));
            FileDelete(EditedContentName);
        }
    }

    [Action("apply-edits")]
    public void ActionApplyEdits()
    {
        ActionApplyTitle();
        ActionApplyContent();
    }

    #endregion

    public string BreadCrumb
    {
        get
        {
            var s = String.Empty;
            var root = MapPath("/");
            if (!root.EndsWith('/'))
                root += "/";
            var last = MapPath("/title.html");
            var current = MapPath("title.html");

            string ReversePath(string path) => path.Replace(root, "/");

            while (true)
            {
                string title = File.Exists(current) ? File.ReadAllText(current) : "Title";
                string path = Path.GetDirectoryName(current);
                if (!path.EndsWith('/'))
                    path += "/";
                var id = String.Empty;
                if (s.Length == 0)
                    id = "id=\"path\" ";
                s = String.Format("<a {0}href=\"{1}\">{2}</a>", id, ReversePath(path), title) + s;
                if (current.Equals(last))
                    return s;
                current = Path.GetDirectoryName(path);
                current = Path.GetDirectoryName(current);
                current = Path.Combine(current, "title.html");
            }
        }
    }

    string EditedTitleName
    {
        get => "edit.title." + IpAddress + ".txt";
    }

    string EditedContentName
    {
        get => "edit.home." + IpAddress + ".txt";
    }

    public override string Title
    {
        get
        {
            if (FileExists(EditedTitleName))
                return HtmlEscape(FileReadText(EditedTitleName));
            if (FileExists("title.html"))
                return HtmlEscape(IncludeRead("title.html"));
            return "Title";
        }
    }

    public string OriginalTitle
    {
        get
        {
            if (FileExists("title.html"))
                return HtmlEscape(IncludeRead("title.html"));
            return "Title";
        }
    }

    public override string Content
    {
        get
        {
            if (FileExists(EditedContentName))
                return FileReadText(EditedContentName);
            if (FileExists("home.html"))
                return IncludeRead("home.html");
            return "<h1>Empty Content</h1>";
        }
    }

    public string EscapedContent => Content; // HtmlEscape(Content);

    public string OriginalContent
    {
        get
        {
            if (FileExists("home.html"))
                return IncludeRead("home.html");
            return "<h1>Empty Content</h1>";
        }
    }

    public string EditorTools
    {
        get
        {
            var tools = IsLocal ? "/Templates/editor-tools-admin.html" : "/Templates/editor-tools.html";
            return IncludeRead(tools);
        }
    }
}