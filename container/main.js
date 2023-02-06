import * as dotenv from 'dotenv'
import * as cron from 'node-cron'
import { syncDailyNotes } from './functions/sync-note-todos.mjs'

dotenv.config()

cron.schedule('0 0 * * *', syncDailyNotes)


