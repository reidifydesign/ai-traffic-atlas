import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, parseCsvObjects } from '../src/csv.mjs';

test('parses quoted fields, doubled quotes and embedded commas', () => {
  const rows = parseCsv('a,b\n"x, y","say ""hi"""\n');
  assert.deepEqual(rows, [['a', 'b'], ['x, y', 'say "hi"']]);
});

test('drops GA4 comment lines even when they contain commas, and blank lines', () => {
  const rows = parseCsv('# Report, for Sep\n# ----\n\nSource,Sessions\nchatgpt.com,3\n');
  assert.deepEqual(rows, [['Source', 'Sessions'], ['chatgpt.com', '3']]);
});

test('strips a BOM and handles CRLF', () => {
  const rows = parseCsv('﻿a,b\r\n1,2\r\n');
  assert.deepEqual(rows, [['a', 'b'], ['1', '2']]);
});

test('keeps an unterminated last line', () => {
  assert.deepEqual(parseCsv('a,b\n1,2'), [['a', 'b'], ['1', '2']]);
});

test('parseCsvObjects keys rows by header and trims values', () => {
  const { headers, records } = parseCsvObjects('Name , Sessions\n x , 4 \n');
  assert.deepEqual(headers, ['Name', 'Sessions']);
  assert.deepEqual(records, [{ Name: 'x', Sessions: '4' }]);
});

test('empty input gives no rows', () => {
  assert.deepEqual(parseCsvObjects(''), { headers: [], records: [] });
});
