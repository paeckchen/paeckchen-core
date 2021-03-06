import * as ava from 'ava';
import { writeFile, readFileSync, existsSync, unlinkSync, unlink, rmdirSync } from 'fs';
import { resolve, dirname } from 'path';

import { FSWatcher } from '../src/watcher';

import { DefaultHost } from '../src/host';

function contextualize<T>(getContext: () => T): ava.RegisterContextual<T> {
  ava.test.beforeEach(t => {
    Object.assign(t.context, getContext());
  });

  return ava.test;
}

const test = contextualize(() => ({
  host: new DefaultHost()
}));

test('DefaultHost#cwd should return the current directory', t => {
  t.is(t.context.host.cwd(), process.cwd());
});

test('DefaultHost#fileExists should return true for existing file', t => {
  t.true(t.context.host.fileExists('./package.json'));
});

test('DefaultHost#fileExists should return false for non-existing file', t => {
  t.false(t.context.host.fileExists('./none-existing-file'));
});

test('DefaultHost#isFile should return true for file', async t => {
  const result = await t.context.host.isFile('./package.json');

  t.true(result);
});

test('DefaultHost#isFile should return false for directory', async t => {
  const result = await t.context.host.isFile('./src');

  t.false(result);
});

test('DefaultHost#isFile should fail for non existing file', async t => {
  try {
    await t.context.host.isFile('../../package.jsno');
    t.fail('Exception expected');
  } catch (e) {
    t.truthy(e.message.match(/no such file/));
  }
});

test('DefaultHost#readFile should return the file content', async t => {
  const path = './package.json';
  const data = await t.context.host.readFile(path);

  t.deepEqual(data, readFileSync(path).toString());
});

test('DefaultHost#readFile should fail for non existing file', async t => {
  const path = '../../package.jsno';
  try {
    await t.context.host.readFile(path);
    t.fail('Exception expected');
  } catch (e) {
    t.truthy(e.message.match(/no such file/));
  }
});

test('DefaultHost#writeFile should dump the content to disk', t => {
  const file = resolve(process.cwd(), 'create-me/dump.txt');
  try {
    t.context.host.writeFile(file, 'test-data');
    t.is(readFileSync(file).toString(), 'test-data');
  } finally {
    if (existsSync(file)) {
      unlinkSync(file);
      rmdirSync(dirname(file));
    }
  }
});

test.cb('DefaultHost#getModificationTime should return the mtime of the given file',
    (t: ava.CallbackTestContext & ava.Context<{ host: DefaultHost; }>) => {
  function write(file: string, content: string, cb: () => void): void {
    writeFile(file, content, err => {
      if (err) {
        t.fail('failed to write to file');
        console.error(err);
        t.end();
      } else {
        cb();
      }
    });
  }
  function unlinkFile(file: string): void {
    unlink(file, () => {
      t.end();
    });
  }

  const file = resolve(process.cwd(), 'mtime-test.txt');
  write(file, '0', async() => {
    try {
      const mtime1 = await t.context.host.getModificationTime(file);
      setTimeout(() => {
        write(file, '1', async() => {
          try {
            const mtime2 = await t.context.host.getModificationTime(file);
            t.true(mtime2 > mtime1);
            t.end();
          } catch (err) {
            t.fail('Failed to get mtime1');
          } finally {
            unlinkFile(file);
          }
        });
      }, 10);
    } catch (e) {
      t.fail('Failed to get mtime1');
      unlinkFile(file);
    }
  });
});

test('DefaultHost#getModificationTime should return -1 if file does not exist', async t => {
  const mtime = await t.context.host.getModificationTime('does-not-exist');

  t.is(mtime, -1);
});

test('DefaultHost#createWatcher should return a new watcher instance', t => {
  const watcher = t.context.host.createWatcher();
  t.true(watcher instanceof FSWatcher);
});
