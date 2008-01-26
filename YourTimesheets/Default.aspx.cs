using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;

public partial class _Default : System.Web.UI.Page 
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }
    protected void InsertNewEntry(object sender, EventArgs e)
    {
        Entries.Insert();
        // Redirect to self to avoid make sure the insertion ends on a GET
        Response.Redirect(Request.Url.AbsoluteUri, false);
    }
}
