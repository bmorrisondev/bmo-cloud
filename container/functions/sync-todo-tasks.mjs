import axios from "axios";
import { refreshTokens } from "../shared/office.mjs";
import { addMinutes } from 'date-fns'
import { createTodo } from '../shared/notion.mjs'
import { sleep } from "../shared/utils.mjs";

export async function syncTodoTasks() {
  console.log("starting syncDailyNotes")
  
  try {
    let tokenResponse = await refreshTokens()
    console.log('got tokens')
  
    let res = await axios({
      method: 'get',
      url: `https://graph.microsoft.com/v1.0/me/todo/lists/${process.env.TASKS_LISTID}/tasks?$filter=status ne 'completed'`,
      headers: {
        "Authorization": `Bearer ${tokenResponse.access_token}`
      }
    })
  
    // wait until task has settled
    const fiveMinAgo = addMinutes(new Date(), -5)
    let tasks = res.data.value.filter(t => new Date(t.createdDateTime) < fiveMinAgo && new Date(t.lastModifiedDateTime) < fiveMinAgo)
    for(let i = 0; i < tasks.length; i++) {
      console.log(`handling: ${tasks[i].title}`)

      // Create todo in notion
      await createTodo(tasks[i].title)

      // Close it in todo
      await axios({
        method: 'patch',
        url: `https://graph.microsoft.com/v1.0/me/todo/lists/${process.env.TASKS_LISTID}/tasks/${tasks[i].id}`,
        headers: {
          "Authorization": `Bearer ${tokenResponse.access_token}`
        },
        data: {
          status: 'completed'
        }
      })

      await sleep(3000)
    }

  } catch (err) {
    console.log(err)
  } 
}