import test from 'node:test';
import assert from 'node:assert/strict';
import { cn } from './utils';

// Unit tests for the `cn` class name utility

test('handles strings', () => {
  assert.equal(cn('foo', 'bar', 'baz'), 'foo bar baz');
  assert.equal(cn('foo', '', 'bar', undefined, null, false, 'baz'), 'foo bar baz');
});

test('handles numbers', () => {
  assert.equal(cn(1, 2, 3), '1 2 3');
  assert.equal(cn(0, 1, 2, 0), '1 2');
});

test('handles nested arrays', () => {
  assert.equal(cn(['foo', ['bar', null], undefined, ['baz', ['', ['qux']]]]), 'foo bar baz qux');
});

test('handles objects with truthy and falsy values', () => {
  assert.equal(
    cn({ foo: true, bar: false, baz: 0, qux: 1, quux: '', corge: 'yes' }),
    'foo qux corge'
  );
});

test('handles mixed inputs', () => {
  const result = cn(
    'foo',
    1,
    ['bar', ['baz', { qux: true, quux: 0 }]],
    { corge: true, grault: false },
    null,
    undefined,
    0
  );
  assert.equal(result, 'foo 1 bar baz qux corge');
});
