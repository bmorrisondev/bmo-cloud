const { Client } = require("@notionhq/client")
const { getLatestNote } = require("./shared/notion");

exports.handler = async function (event, context) {
  let latestNote = await getLatestNote()
  
  notion = new Client({
    auth: process.env.NOTION_KEY
  })
  let children = await notion.blocks.children.list({
    block_id: latestNote.id,
    page_size: 100
  })

  console.log(`got ${children.results.length} blocks`)

  let todos = children.results.filter(c => c.type === 'to_do')
  let flattened = []
  todos.forEach(t => {
    let f = {
      id: t.id,
      text: t.to_do.rich_text[0].plain_text
    }
    flattened.push(f)
  })

  console.log(flattened)

  // TODO: for each task, push to ms todo, complete task in notion

  return {
    statusCode: 200,
  }
}