import { Client } from "@notionhq/client";
import { sleep } from "../shared/utils.mjs"
import { addDays, format } from "date-fns";

export async function clearWeeklyLog (event, context) {
  console.log("starting clearWeeklyLog")
  try {    
    let notion = new Client({
      auth: process.env.NOTION_KEY
    })

    // create new entry for the week
    // get previous monday
    // create a page titled "week starting {prev mon}"
    // -- date range from prev mon to current day
    let previousMonday = addDays(new Date(), -6)
    let pageTitle = `Week starting ${previousMonday.toLocaleDateString()}`
    let newPage = await notion.pages.create({
      parent: {
        database_id: process.env.NOTES_DBID
      },
      properties: {
        "Name": {
          title: [
            {
              text: {
                content: pageTitle
              }
            }
          ]
        },
        "Date": {
          "type": "date",
          "date": {
            "start": format(previousMonday, "yyyy-MM-dd"),
            "end":  format(new Date(), "yyyy-MM-dd")
          }
        }
      }
    })

    let blocks = []
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

    for(let i = 0; i < blocks.length; i++) {
      // TODO: If the block is an image, upload it to an s3 bucket or something
      console.log(`moving block ${i + 1}/${blocks.length}`)
      let appendResponse = await notion.blocks.children.append({
        block_id: newPage.id,
        children: [
          blocks[i]
        ]
      })
      let appendedBlockId = appendResponse.results[0].id
      if(blocks[i].has_children) {
        await handleChildren(blocks[i].id, appendedBlockId)
      }
      await sleep(500)
    }
  } catch (err) {
    console.error('drstrange', err);
  }
}

async function handleChildren(sourceBlockId, parentBlockId) {
  let notion = new Client({
    auth: process.env.NOTION_KEY
  })

  let blocks = []
  let children = await notion.blocks.children.list({
    block_id: sourceBlockId,
    page_size: 100
  })
  blocks = blocks.concat(children.results)

  while(children.next_cursor) {
    children = await notion.blocks.children.list({
      block_id: process.env.DAILY_NOTE_ID,
      page_size: 100,
      start_cursor: children.next_cursor
    })
    blocks = blocks.concat(children.results)
  }

  for(let i = 0; i < blocks.length; i++) {
    let appendResponse = await notion.blocks.children.append({
      block_id: parentBlockId,
      children: [
        blocks[i]
      ]
    })
    let appendedBlockId = appendResponse.results[0].id
    if(blocks[i].has_children) {
      await handleChildren(blocks[i].id, appendedBlockId)
    }
    await sleep(500)
  }
}