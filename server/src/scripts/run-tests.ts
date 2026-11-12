import { spawn } from 'child_process';
import path from 'path';

process.env.NODE_ENV = 'test';

const testProcess = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tsx', '--test', 'src/**/__tests__/*.test.ts'],
  {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'test' },
  }
);

testProcess.on('exit', (code) => {
  process.exit(code || 0);
});
