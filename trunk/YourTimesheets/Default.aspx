<%@ Page Language="C#" ViewStateEncryptionMode="never" EnableViewState="false" EnableEventValidation="false" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" >
<head>
    <title>These are Your Timesheets</title>
    <script type="text/javascript" src="Scripts/gears_init.js"></script>
    <script type="text/javascript" src="Scripts/dom.js"></script>
    <script type="text/javascript" src="Scripts/database.js"></script>
    <script type="text/javascript" src="Scripts/store.js"></script>
    <script type="text/javascript" src="Scripts/sync.js"></script>
    <script type="text/javascript" src="Scripts/validator.js"></script>
    <script type="text/javascript" src="Scripts/monitor.js"></script>
    <script type="text/javascript" src="Scripts/breadboard.js"></script>
    <link type="text/css" rel="stylesheet" href="Styles/screen.css" />
</head>
<body>
    <form id="YourTimesheets" runat="server">
        <h1>These are Your Timesheets</h1>
        <div id="NewEntry">
            <h2>New Entry</h2>
            <asp:SqlDataSource ID="Entries" runat="server" ConnectionString="<%$ ConnectionStrings:YourTimesheets %>"
                InsertCommand="INSERT INTO [Entries] ([StartDateTime], [DurationMins], [Project], [Billable], [Comment]) VALUES (@StartDateTime, @DurationMins, @Project, @Billable, @Comment)"
                SelectCommand="SELECT * FROM [Entries] ORDER BY [StartDateTime] DESC, [Project] DESC">
                <InsertParameters>
                    <asp:ControlParameter Name="StartDateTime" Type="DateTime" ControlID="StartDateTime" />
                    <asp:ControlParameter Name="DurationMins" Type="Int32" ControlID="DurationMins" />
                    <asp:ControlParameter Name="Project" Type="String" ControlID="Project" />
                    <asp:ControlParameter Name="Billable" Type="Boolean" ControlID="Billable" />
                    <asp:ControlParameter Name="Comment" Type="String" ControlID="Comment" />
                </InsertParameters>
            </asp:SqlDataSource>
            <div class="field">
                <label for="StartDateTime">Started On (mm/dd/yyyy hh:mm):</label>
                <asp:TextBox ID="StartDateTime" CssClass="datetime" runat="server"></asp:TextBox>
            </div>
            <div class="field">
                <label for="DurationMins">Worked for (minutes):</label>
                <asp:TextBox ID="DurationMins" CssClass="number" runat="server"></asp:TextBox>
            </div>
            <div class="field">
                <label for="Project">On Project:</label>
                <asp:TextBox ID="Project" CssClass="text" runat="server"></asp:TextBox>
            </div>
            <div class="field checkbox">
                <asp:CheckBox ID="Billable" runat="server" Text="Billable" />
            </div>
            <div class="field">
                <label for="Comment">Comments:</label>
                <asp:TextBox ID="Comment" CssClass="text" runat="server" TextMode="MultiLine"></asp:TextBox>
            </div>
            <div class="action">
                <asp:Button ID="SubmitNewEntry" runat="server" Text="Submit Time Entry" OnClick="InsertNewEntry" />
            </div>
        </div>
        <div id="OnlineSheet">
            <h2>Timesheet</h2>
            <asp:GridView ID="Timesheet" runat="server" AutoGenerateColumns="False" GridLines="none" DataKeyNames="ID"
                DataSourceID="Entries">
                <Columns>
                    <asp:BoundField DataField="StartDateTime" HeaderText="StartDateTime" />
                    <asp:BoundField DataField="DurationMins" HeaderText="DurationMins" />
                    <asp:BoundField DataField="Project" HeaderText="Project" />
                    <asp:CheckBoxField DataField="Billable" HeaderText="Billable" />
                    <asp:BoundField DataField="Comment" HeaderText="Comment" />
                </Columns>
            </asp:GridView>
        </div>
        <div id="Footer">
            This is YourTimesheets, a sample application that combines 
            <a href="http://code.google.com/apis/gears/">Google Gears</a> and <a href="http://asp.net">ASP.NET</a>. 
            Feel free to use its source code under the 
            <a rel="license" href="http://www.opensource.org/licenses/mit-license.php">MIT License</a>.
        </div>
    </form>
</body>
</html>
