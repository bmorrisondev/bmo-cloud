import { Client } from "@notionhq/client"
import fetch from 'node-fetch'

// const dailyTodos = [
//   "review email",
//   "review github issues",
//   "review todos",
//   "review projects"
// ]

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
          "children":[
            {
              "type": "to_do",
              "to_do": {
                "rich_text": [{
                  "type": "text",
                  "text": {
                    "content": "review email",
                  }
                }],
                "checked": false,
                "color": "default"
              }
            },
            {
              "type": "to_do",
              "to_do": {
                "rich_text": [{
                  "type": "text",
                  "text": {
                    "content": "review github issues"
                  }
                }],
                "checked": false,
                children: [
                  {
                    "type": "to_do",
                    "to_do": {
                      "rich_text": [{
                        "type": "text",
                        "text": {
                          "content": "assigned issues",
                          "link": {
                            url: "https://github.com/issues?q=is%3Aopen+is%3Aissue+assignee%3Abmorrisondev+archived%3Afalse+user%3Aplanetscale"
                          }
                        }
                      }],
                      "checked": false,
                      "color": "default"
                    }
                  },
                  {
                    "type": "to_do",
                    "to_do": {
                      "rich_text": [{
                        "type": "text",
                        "text": {
                          "content": "assigned prs",
                          "link": {
                            url: "https://github.com/pulls/assigned"
                          }
                        }
                      }],
                      "checked": false,
                      "color": "default"
                    }
                  },
                  {
                    "type": "to_do",
                    "to_do": {
                      "rich_text": [{
                        "type": "text",
                        "text": {
                          "content": "public docs issues",
                          "link": {
                            url: "https://github.com/planetscale/docs/issues"
                          }
                        }
                      }],
                      "checked": false,
                      "color": "default"
                    }
                  },
                ]
              }
            },
            {
              "type": "to_do",
              "to_do": {
                "rich_text": [{
                  "type": "text",
                  "text": {
                    "content": "organize projects & tasks",
                    "link": {
                      url: "https://www.notion.so/brianmmdev/Organize-dashboard-11007258c78541739de2dca30002e795?pvs=4"
                    }
                  }
                }],
                "checked": false,
                "color": "default"
              }
            },
          ]
        }
      }
    ]
  }

  // and add the inspirational quote
  let quote = getRandomQuote()
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

async function getRandomQuote() {
  let res = await fetch('https://zenquotes.io/api/today')
  let data = await res.json()
  if (data.length > 0) {
    const { q, a } = data[0]
    return { text: q, author: a }
  }
}