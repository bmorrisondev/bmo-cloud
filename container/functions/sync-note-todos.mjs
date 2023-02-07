import { Client } from "@notionhq/client";
import { sleep } from "../shared/utils.mjs"

export async function syncDailyNotes (event, context) {
  console.log("starting syncDailyNotes")
  try {    
    let notion = new Client({
      auth: process.env.NOTION_KEY
    })

    let blocks = []
    
    // get all the blocks on that page 
    let children = await notion.blocks.children.list({
      block_id: process.env.DAILY_NOTE_ID,
      page_size: 100
    })

    blocks = blocks.concat(children.results)

    while(children.next_cursor) {
      console.log("fetching more...", children.next_cursor)
      children = await notion.blocks.children.list({
        block_id: process.env.DAILY_NOTE_ID,
        page_size: 100,
        start_cursor: children.next_cursor
      })
      blocks = blocks.concat(children.results)
    }

    console.log(`got ${blocks.length} blocks`)

    // flatten the list of blocks into only the to dos
    let todos = blocks.filter(c => c.type === 'to_do')
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