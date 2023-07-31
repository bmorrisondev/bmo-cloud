import * as dotenv from 'dotenv'
dotenv.config();

import { syncDailyTodos } from "./functions/sync-note-todos.mjs";
import { syncTodoTasks } from './functions/sync-todo-tasks.mjs';
import { refreshTokens } from './shared/office.mjs';
import { addDailyNoteSection } from './functions/add-daily-note-section.mjs';
import { clearWeeklyLog } from './functions/clear-weekly-log.mjs';


(async () => {
  await syncDailyTodos();
})()