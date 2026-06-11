import { execSync } from 'child_process';
import os from 'os';

const ports = [3000, 24678];
const isWindows = os.platform() === 'win32';

ports.forEach(port => {
  try {
    if (isWindows) {
      execSync(`FOR /F "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /f /pid %a`, { stdio: 'ignore' });
    } else {
      execSync(`fuser -k ${port}/tcp || lsof -ti:${port} | xargs -r kill -9`, { stdio: 'ignore' });
    }
    console.log(`[Port Cleaner] Freed up port ${port}`);
  } catch (e) {
    // Port likely not in use, ignore gracefully
  }
});
