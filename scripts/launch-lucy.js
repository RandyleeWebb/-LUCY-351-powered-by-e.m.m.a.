#!/usr/bin/env node

/**
 * WHAT THIS DOES:
 * Quick launcher script for Lucy AGI OS with preconfigured modes. Simplifies
 * common launch configurations so you don't need to remember all the CLI flags.
 *
 * WHY THIS EXISTS:
 * Starting Lucy in Sovereign mode requires multiple flags. This launcher provides
 * named presets: safe, partner, sovereign, dev. Makes it easy to switch between
 * trust tiers and operational modes.
 *
 * HOW THIS WORKS:
 * Parses mode argument, builds appropriate node command with flags, spawns Lucy
 * with the selected configuration. Displays trust tier and operational mode info.
 *
 * USAGE:
 *   npm run lucy:safe       # Default safe mode (Initiate tier)
 *   npm run lucy:partner    # Partner mode (FiveM/UE5 access)
 *   npm run lucy:sovereign  # Sovereign mode (full OS control)
 *   npm run lucy:dev        # Development mode with verbose logging
 */

import { spawn } from 'child_process';

const modes = {
  safe: {
	name: 'Safe Mode',
	description: 'Default sandboxed operation (Initiate tier)',
	flags: []
  },

  partner: {
	name: 'Partner Mode',
	description: 'FiveM/UE5/Unity project access (Partner tier)',
	flags: [
	  '--initial-trust-score', '60',
	  '--approval-policy', 'trust-adaptive'
	]
  },

  sovereign: {
	name: 'Sovereign Mode',
	description: 'Full OS control with admin override',
	flags: [
	  '--sandbox-mode', 'off',
	  '--approval-policy', 'high-trust-auto',
	  '--admin-override',
	  '--danger-full-access',
	  '--initial-trust-score', '85'
	]
  },

  dev: {
	name: 'Development Mode',
	description: 'Verbose logging with Partner tier access',
	flags: [
	  '--dev-mode',
	  '--log-level', 'debug',
	  '--initial-trust-score', '55'
	]
  }
};

function printBanner(mode) {
  console.log('\n' + '='.repeat(80));
  console.log('🌟 LUCY AGI OS LAUNCHER 🌟');
  console.log('='.repeat(80));
  console.log(`Mode: ${mode.name}`);
  console.log(`Description: ${mode.description}`);
  console.log(`Flags: ${mode.flags.join(' ') || '(none - default config)'}`);
  console.log('='.repeat(80) + '\n');
}

function printHelp() {
  console.log('\nLucy AGI OS Launcher\n');
  console.log('Usage: npm run lucy:<mode>\n');
  console.log('Available modes:\n');

  for (const [key, mode] of Object.entries(modes)) {
	console.log(`  lucy:${key.padEnd(10)} - ${mode.description}`);
  }

  console.log('\nExamples:');
  console.log('  npm run lucy:safe       # Safe sandboxed mode');
  console.log('  npm run lucy:partner    # FiveM development mode');
  console.log('  npm run lucy:sovereign  # Full OS control (requires confirmation)');
  console.log('  npm run lucy:dev        # Development with verbose logs\n');

  console.log('For custom configuration, use:');
  console.log('  npm start -- <flags>\n');

  console.log('See README_AGI_OS.md for full documentation.\n');
}

async function confirmSovereignMode() {
  return new Promise((resolve) => {
	console.log('\n⚠️  WARNING: SOVEREIGN MODE ⚠️');
	console.log('\nYou are about to start Lucy with:');
	console.log('  ✓ Full filesystem access (C:\\ root)');
	console.log('  ✓ System file modification');
	console.log('  ✓ Self-code modification');
	console.log('  ✓ Dependency installation');
	console.log('  ✓ Service restart capability');
	console.log('  ✓ Auto-approval bypass\n');

	console.log('Emma oversight: ENABLED (recommended)');
	console.log('EagleEye monitoring: ENABLED\n');

	process.stdout.write('Are you sure you want to continue? (yes/no): ');

	process.stdin.once('data', (data) => {
	  const answer = data.toString().trim().toLowerCase();
	  resolve(answer === 'yes' || answer === 'y');
	});
  });
}

async function main() {
  const args = process.argv.slice(2);
  const modeArg = args[0];

  if (!modeArg || modeArg === 'help' || modeArg === '--help') {
	printHelp();
	process.exit(0);
  }

  const mode = modes[modeArg];

  if (!mode) {
	console.error(`\nError: Unknown mode '${modeArg}'\n`);
	printHelp();
	process.exit(1);
  }

  printBanner(mode);

  // Confirm sovereign mode
  if (modeArg === 'sovereign') {
	const confirmed = await confirmSovereignMode();
	if (!confirmed) {
	  console.log('\nSovereign mode cancelled. Lucy remains in safe mode.\n');
	  process.exit(0);
	}
	console.log('\n✓ Confirmed. Starting Lucy in Sovereign mode...\n');
  }

  // Build command
  const command = 'node';
  const commandArgs = ['dist/main.js', ...mode.flags];

  // Spawn Lucy
  const lucy = spawn(command, commandArgs, {
	stdio: 'inherit',
	shell: true
  });

  lucy.on('error', (error) => {
	console.error('\nError starting Lucy:', error);
	process.exit(1);
  });

  lucy.on('exit', (code) => {
	console.log(`\nLucy exited with code ${code}`);
	process.exit(code || 0);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
	console.log('\n\nShutting down Lucy...');
	lucy.kill('SIGINT');
  });
}

main().catch(error => {
  console.error('\nLauncher error:', error);
  process.exit(1);
});
