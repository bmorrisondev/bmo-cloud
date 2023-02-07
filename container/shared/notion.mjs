import { Client } from "@notionhq/client"

export async function getLatestNote() {
  const notion = new Client({
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

export async function createTodo(text) {
  const notion = new Client({
    auth: process.env.NOTION_KEY
  })

  return await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: process.env.TASKS_DBID
    },
    properties: {
      "Name": {
        title: [
          {
            text: {
              content: text
            }
          }
        ]
      }
    }
  })
}