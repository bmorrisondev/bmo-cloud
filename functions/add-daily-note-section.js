const { Client } = require("@notionhq/client")
const Quote = require('inspirational-quotes');


const dailyTodos = [
  "review email",
  "review github issues",
  "review todos"
]

exports.handler = async function (event, context) {

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

  let latestNote = res.results[0]

  params = {
    block_id: latestNote.id,
    children: [
      {
        type: "divider",
        divider: {}
      },
      {
        "heading_2": {
          "rich_text": [
            {
              "text": {
                "content": (new Date()).toLocaleDateString()
              }
            }
          ]
        }
      },
      {
        "type": "toggle",
        "toggle": {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "daily tasks",
              }
            }
          ],
          "color": "default",
          "children":[]
        }
      }
    ]
  }

  dailyTodos.forEach(todo => {
    params.children[2].toggle.children.push({
      "type": "to_do",
      "to_do": {
        "rich_text": [{
          "type": "text",
          "text": {
            "content": todo,
            "link": null
          }
        }],
        "checked": false,
        "color": "default"
      }
    })
  })

  let quote = Quote.getQuote()

  params.children.push({
    "type": "quote",
    "quote": {
      "rich_text": [{
        "type": "text",
        "text": {
          "content": `${quote.text}\n• ${quote.author}`,
        },
      }],
      "color": "default"
    }
  })

  await notion.blocks.children.append(params)

  return {
    statusCode: 200,
  }
}