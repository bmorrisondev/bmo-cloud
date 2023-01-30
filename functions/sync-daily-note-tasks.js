import { Client } from "@notionhq/client";
import { getLatestNote } from "./shared/notion";
import { connect } from '@planetscale/database';
import axios from 'axios';

exports.handler = async function (event, context) {
  let latestNote = await getLatestNote()
  
  notion = new Client({
    auth: process.env.NOTION_KEY
  })
  
  let children = await notion.blocks.children.list({
    block_id: latestNote,
    page_size: 100
  })

  console.log(`got ${children.results.length} blocks`)

  let todos = children.results.filter(c => c.type === 'to_do')
  let flattened = []
  todos.forEach(t => {
    let text = t.to_do.rich_text[0].plain_text
    if(!text.endsWith("🔄")) {
      let f = {
        id: t.id,
        text: t.to_do.rich_text[0].plain_text
      }
      flattened.push(f)
    }
  })

  if(flattened.length) {
    const config = {
      host: process.env.DBHOST,
      username: process.env.DBUSER,
      password: process.env.DBPASS
    }
    const conn = connect(config)
    let results = await conn.execute("select value from configs where configKey = 'msgraph'")
    const { access_token } = results.rows[0].value
    let taskListId = "AQMkADFlNGUxN2MyLTJmMjctNGIwMS1iODQ1LTUxOWQ2ZjkzMDVlYgAuAAADKx57b7PSA0KvuWYVXTof6AEAmeMOc79glkajPFujyvDgUwAAAgESAAAA"
  
    // TODO: for each task, push to ms todo, complete task in notion
    flattened.forEach(async t => {
      // Create task
      await axios({
        url: `https://graph.microsoft.com/v1.0/me/todo/lists/${taskListId}/tasks`,
        method: 'post',
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json"
        },
        data: {
          title: t.text
        }
      })

      // add sync emoji
      await notion.blocks.update({
        block_id: t.id,
        to_do: {
          type: "to_do",
          rich_text: [
            {
              text:{
                content: `${t.text} 🔄`,
              } 
            }
          ]
        }
      })
    })
  }

  return {
    statusCode: 200,
  }
}