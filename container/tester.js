import * as dotenv from 'dotenv'
import { syncDailyNotes } from "./functions/sync-note-todos.mjs";

dotenv.config();

(async () => {
  await syncDailyNotes();
})()