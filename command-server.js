/**
 * LUCY SOVEREIGN - Command Execution Server
 * 
 * Bridges web UI to Windows desktop via HTTP → PowerShell
 * Allows Lucy to launch real applications from the browser
 */

import { createServer } from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PORT = 3000;

// CORS headers for Vite dev server (localhost:5173)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

const server = createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
	res.writeHead(200, CORS_HEADERS);
	res.end();
	return;
  }

  // Only accept POST to /execute
  if (req.method !== 'POST' || req.url !== '/execute') {
	res.writeHead(404, CORS_HEADERS);
	res.end(JSON.stringify({ error: 'Not found' }));
	return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
	try {
	  const { command, args, shell } = JSON.parse(body);

	  console.log('\n🎯 [Lucy Command Server] Execution Request:');
	  console.log(`   Command: ${command}`);
	  console.log(`   Args: ${JSON.stringify(args)}`);
	  console.log(`   Shell: ${shell}`);

	  // Build PowerShell command
	  const psCommand = `${command} ${args.join(' ')}`;
	  console.log(`   Full Command: ${psCommand}`);

	  // Execute via PowerShell
	  const { stdout, stderr } = await execAsync(psCommand, {
		shell: 'powershell.exe',
		timeout: 10000
	  });

	  console.log('   ✅ Execution successful');
	  if (stdout) console.log(`   stdout: ${stdout.trim()}`);
	  if (stderr) console.log(`   stderr: ${stderr.trim()}`);

	  res.writeHead(200, CORS_HEADERS);
	  res.end(JSON.stringify({
		success: true,
		command: psCommand,
		stdout: stdout.trim(),
		stderr: stderr.trim(),
		timestamp: new Date().toISOString()
	  }));

	} catch (error) {
	  console.error('   ❌ Execution failed:', error.message);

	  res.writeHead(500, CORS_HEADERS);
	  res.end(JSON.stringify({
		success: false,
		error: error.message,
		command: body,
		timestamp: new Date().toISOString()
	  }));
	}
  });
});

server.listen(PORT, () => {
  console.log('\n🚀 Lucy Sovereign Command Server Online');
  console.log(`   Port: ${PORT}`);
  console.log(`   Endpoint: http://localhost:${PORT}/execute`);
  console.log(`   Shell: PowerShell`);
  console.log('\n✅ Ready to execute desktop commands from Lucy UI\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Lucy Command Server...');
  server.close(() => {
	console.log('✅ Server closed');
	process.exit(0);
  });
});
