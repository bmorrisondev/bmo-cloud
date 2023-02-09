import { Client } from "@notionhq/client"
import * as Quote from 'inspirational-quotes'

const dailyTodos = [
  "review email",
  "review github issues",
  "review todos",
  "review projects"
]

export async function addDailyNoteSection (event, context) {
  let notion = new Client({
    auth: process.env.NOTION_KEY
  })

  let title = (new Date()).toLocaleDateString()
  let journalPage = await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: process.env.JOURNAL_DBID
    },
    "properties": {
      "Name": {
        "title": [
          {
            "text": {
              "content": title
            }
          }
        ]
      }
    }
  })

  console.log(journalPage)

  // this is a template to add the blocks I want
  let params = {
    block_id: process.env.DAILY_NOTE_ID,
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
                "content": title,
                link: {
                  url: journalPage.url
                }
              },
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

  // this block adds my daily todos from an array
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

  // and add the inspirational quote
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

  let appendBlockRes = await notion.blocks.children.append(params)
  console.log(appendBlockRes)

  return {
    statusCode: 200,
  }
}