import * as dotenv from 'dotenv'
dotenv.config();

import { syncDailyNotes } from "./functions/sync-note-todos.mjs";
import { syncTodoTasks } from './functions/sync-todo-tasks.mjs';
import { refreshTokens } from './shared/office.mjs';


(async () => {
  await syncDailyNotes();
})()