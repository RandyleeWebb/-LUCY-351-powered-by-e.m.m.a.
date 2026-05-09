/**
 * LUCY PHASE 16 — Executable Trust Layer Harness
 * Minimal, no-dependency test runner for the private source-of-truth scaffold.
 */

interface TestDef {
  name: string;
  fn: () => void | Promise<void>;
}

const tests: TestDef[] = [];

export function test(name: string, fn: () => void | Promise<void>) {
  tests.push({ name, fn });
}

export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message} (Expected ${expected}, got ${actual})`);
  }
}

export function assertIncludes(haystack: string, needle: string, message: string) {
  if (!haystack.includes(needle)) {
    throw new Error(`Assertion failed: ${message} (Expected "${haystack}" to include "${needle}")`);
  }
}

export async function run() {
  let passed = 0;
  let failed = 0;
  const startTime = Date.now();

  console.log('--- Lucy-core-AI Smoke Tests ---');

  for (const t of tests) {
    try {
      await t.fn();
      console.log(`PASS ${t.name}`);
      passed++;
    } catch (err: any) {
      console.log(`FAIL ${t.name}`);
      console.error(`  Error: ${err.message}`);
      failed++;
    }
  }

  const duration = Date.now() - startTime;
  console.log('--------------------------------');
  console.log(`Lucy-core-AI smoke tests passed: ${passed}/${passed + failed} in ${duration}ms.`);
  
  if (failed > 0) {
    process.exit(1);
  }
}
