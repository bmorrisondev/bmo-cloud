import { Client } from "@notionhq/client"

export async function getLatestNote() {
  notion = new Client({
    auth: process.env.NOTION_KEY
  })

  let params = {
    database_id: process.env.NOTES_DBID,
    sorts: [
      {
        property: 'Date',
        direction: 'descending'
      }
    ]
  }
  let res = await notion.databases.query(params)

  return res.results[0]
}