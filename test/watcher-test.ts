import test from 'ava';
import { ChokidarMock } from './helper';

import { FSWatcher as DefaultWatcher } from '../src/watcher';

test('Watcher should register callbacks on the watcher if enabled', t => {
  const chokidar = new ChokidarMock();
  const onUpdate = (event: string, fileName: string): void => undefined;

  const watcher = new DefaultWatcher(chokidar);
  watcher.start(onUpdate);

  t.deepEqual(chokidar.onCalls, ['add', 'change', 'unlink']);
});

test('Watcher should ignore changes of new files not on the watch list', t => {
  let updateFileName: string|undefined;

  const chokidar = new ChokidarMock();
  const onUpdate = (event: string, fileName: string): void => {
    updateFileName = fileName;
  };

  const watcher = new DefaultWatcher(chokidar);
  watcher.start(onUpdate);
  chokidar.emit('add', 'new-file');

  t.is(updateFileName, undefined);
});

test('Watcher should ignore changes of existing files not on the watch list', t => {
  let updateFileName: string|undefined;

  const chokidar = new ChokidarMock();
  const onUpdate = (event: string, fileName: string): void => {
    updateFileName = fileName;
  };

  const watcher = new DefaultWatcher(chokidar);
  watcher.start(onUpdate);
  chokidar.emit('change', 'changed-file');

  t.is(updateFileName, undefined);
});

test('Watcher should ignore removals of existing files not on the watch list', t => {
  let updateFileName: string|undefined;

  const chokidar = new ChokidarMock();
  const onUpdate = (event: string, fileName: string): void => {
    updateFileName = fileName;
  };

  const watcher = new DefaultWatcher(chokidar);
  watcher.start(onUpdate);
  chokidar.emit('unlink', 'removed-file');

  t.is(updateFileName, undefined);
});

test('Watcher should register folders with new files to the watcher', t => {
  let updateFileName: string;

  const chokidar = new ChokidarMock();
  const onUpdate = (event: string, fileName: string): void => {
    updateFileName = fileName;
  };

  const watcher = new DefaultWatcher(chokidar);
  watcher.start(onUpdate);
  watcher.watchFile('dir/new-file');

  t.deepEqual(chokidar.addCalls, ['dir']);
});

test('Watcher should remove folders from the watcher if no watched files left', t => {
  let updateFileName: string;

  const chokidar = new ChokidarMock();
  const onUpdate = (event: string, fileName: string): void => {
    updateFileName = fileName;
  };

  const watcher = new DefaultWatcher(chokidar);
  watcher.start(onUpdate);
  watcher.watchFile('dir/file');
  watcher.unwatchFile('dir/file');

  t.deepEqual(chokidar.unwatchCalls, ['dir']);
});

test('Watcher should keep watching folders if watched files left', t => {
  let updateFileName: string;

  const chokidar = new ChokidarMock();
  const onUpdate = (event: string, fileName: string): void => {
    updateFileName = fileName;
  };

  const watcher = new DefaultWatcher(chokidar);
  watcher.start(onUpdate);
  watcher.watchFile('dir/file1');
  watcher.watchFile('dir/file2');
  chokidar.emit('unlink', 'dir/file1');

  t.deepEqual(chokidar.unwatchCalls, []);
});

test('Watcher should notify if watched file changes', t => {
  let calledEvent: string|undefined;
  let calledFile: string|undefined;
  const onUpdate = (event: string, fileName: string): void => {
    calledEvent = event;
    calledFile = fileName;
  };
  const chokidar = new ChokidarMock();

  const watcher = new DefaultWatcher(chokidar);
  watcher.start(onUpdate);
  watcher.watchFile('dir/file');
  chokidar.emit('change', 'dir/file');

  t.is(calledEvent, 'update');
  t.is(calledFile, 'dir/file');
});

test('Watcher should notify if watched file is added', t => {
  let calledEvent: string|undefined;
  let calledFile: string|undefined;
  const onAdd = (event: string, fileName: string): void => {
    calledEvent = event;
    calledFile = fileName;
  };
  const chokidar = new ChokidarMock();

  const watcher = new DefaultWatcher(chokidar);
  watcher.start(onAdd);
  watcher.watchFile('dir/file');
  chokidar.emit('add', 'dir/file');

  t.is(calledEvent, 'add');
  t.is(calledFile, 'dir/file');
});
