import * as dotenv from 'dotenv'
import * as cron from 'node-cron'
import { Client } from "@notionhq/client";

dotenv.config()

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getLatestNote() {
  let notion = new Client({
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

export async function syncDailyNotes (event, context) {
  try {
    // get the latest note in the db
    let latestNote = await getLatestNote()
    
    let notion = new Client({
      auth: process.env.NOTION_KEY
    })
    
    // get all the blocks on that page
    let children = await notion.blocks.children.list({
      block_id: latestNote.id,
      page_size: 100
    })

    console.log(`got ${children.results.length} blocks`)

    // flatten the list of blocks into only the to dos
    let todos = children.results.filter(c => c.type === 'to_do')
    let flattened = []
    todos.forEach(t => {
      if(t.to_do.rich_text[0].type !== "mention") {
        let f = {
          id: t.id,
          text: t.to_do.rich_text[0].plain_text
        }
        flattened.push(f)
      }
    })

    console.log(flattened.length)

    // loop over the list and create the entry in the tasks database
    if(flattened.length) {    
      for (let i = 0; i < flattened.length; i++) {
        let t = flattened[i]
        console.log('processing', t.text)

        // Create task
        let page = await notion.pages.create({
          parent: {
            type: "database_id",
            database_id: process.env.TASKS_DBID
          },
          "properties": {
            "Name": {
              "title": [
                {
                  "text": {
                      "content": t.text
                  }
                }
              ]
            }
          }
        })

        // also, update the block in the notes page to be a backlink to the todo entry
        // this allows me to easily jump right to that task if I want to do anything about it.
        await notion.blocks.update({
          block_id: t.id,
          to_do: {
            type: "to_do",
            rich_text: [
                {
                  "type": "mention",
                  "mention": {
                      "type": "page",
                      "page": {
                          "id": page.id
                      }
                  },
                  "annotations": {
                      "bold": false,
                      "italic": false,
                      "strikethrough": false,
                      "underline": false,
                      "code": false,
                      "color": "default"
                  },
                  "href": `https://www.notion.so/${page.id.replace(/-/g, "")}`
              }
            ]
          }
        })
        await sleep(3000)
      }
    }
  } catch (err) {
    console.error('drstrange', err);
  }
}


cron.schedule('0 0 * * 1-5', syncDailyNotes)


