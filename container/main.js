import * as cron from 'node-cron'
import * as dotenv from 'dotenv'
dotenv.config()

import { syncDailyTodos } from './functions/sync-note-todos.mjs'
// import { syncTodoTasks } from './functions/sync-todo-tasks.mjs'
import { addDailyNoteSection } from './functions/add-daily-note-section.mjs'

cron.schedule('0 1 * * *', syncDailyTodos)
cron.schedule('0 2 * * *', addDailyNoteSection)
cron.schedule('*/5 * * * *', syncTodoTasks)


