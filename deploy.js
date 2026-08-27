const { spawn } = require('child_process');

const surge = spawn('npx.cmd', ['surge', '.', 'wedding-mm-2026-unique-test.surge.sh'], { shell: true });

surge.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('stdout:', output);
  if (output.toLowerCase().includes('email:')) {
    surge.stdin.write('wedding2026-test-agy@gmail.com\n');
  }
  if (output.toLowerCase().includes('password:')) {
    surge.stdin.write('AgyPassword123!\n');
  }
});

surge.stderr.on('data', (data) => {
  console.error('stderr:', data.toString());
});

surge.on('close', (code) => {
  console.log(`surge exited with code ${code}`);
});
