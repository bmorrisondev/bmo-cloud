import * as cron from 'node-cron'
import * as dotenv from 'dotenv'
dotenv.config()

import { syncDailyNotes } from './functions/sync-note-todos.mjs'
import { syncTodoTasks } from './functions/sync-todo-tasks.mjs'

cron.schedule('0 0 * * *', syncDailyNotes)
cron.schedule('*/5 * * * *', syncTodoTasks)


