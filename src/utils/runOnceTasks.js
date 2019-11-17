import Dexie from 'dexie';

import * as ls from './localStorage';
import dexie from './dexie';

export default function runOnceTasks() {

  const history = ls.get('history.tasks') || [];

  if (!history.find(t => t.id === 'resetlang_august192019')) {
    if (ls.get('setting.language') === 'en-au') ls.set('setting.language', 'en');

    ls.update('history.tasks', { id: 'resetlang_august192019' });
  }

  if (!history.find(t => t.id === 'reauth_november042019')) {
    ls.del('setting.auth');

    ls.update('history.tasks', { id: 'reauth_november042019' });
  }

  if (!history.find(t => t.id === 'manifest_november172019')) {
    dexie.table('manifest').clear()

    ls.update('history.tasks', { id: 'manifest_november172019' });
  }

  if (!history.find(t => t.id === 'manifest_november172019-2')) {
    Dexie.delete('braytech');

    ls.update('history.tasks', { id: 'manifest_november172019-2' });
  }

}