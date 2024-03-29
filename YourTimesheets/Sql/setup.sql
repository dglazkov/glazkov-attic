-- To set up database
-- 1. Create Database YourTimesheets
-- 2. Make sure that the connection in Web.config points to this database
-- 3. Run this query

/****** Object:  Table [dbo].[Entries]    Script Date: 01/25/2008 21:29:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Entries](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[StartDateTime] [datetime] NOT NULL,
	[DurationMins] [int] NOT NULL CONSTRAINT [DF_Entries_DurationMins]  DEFAULT ((15)),
	[Project] [nvarchar](100) NULL,
	[Billable] [bit] NOT NULL CONSTRAINT [DF_Entries_Billable]  DEFAULT ((0)),
	[Comment] [ntext] NULL,
 CONSTRAINT [PK_Entries] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
