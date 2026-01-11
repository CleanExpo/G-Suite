#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

class GSDInstaller {
  constructor() {
    this.projectRoot = process.cwd();
    this.flags = this.parseFlags();
  }

  parseFlags() {
    const args = process.argv.slice(2);
    return {
      force: args.includes('--force') || args.includes('-f'),
      verbose: args.includes('--verbose') || args.includes('-v'),
      dryRun: args.includes('--dry-run'),
      help: args.includes('--help') || args.includes('-h')
    };
  }

  log(msg, type = 'info') {
    const icons = { info: '  ', success: '✓ ', error: '✗ ', warn: '⚠️  ' };
    console.log(`${icons[type]}${msg}`);
  }

  async run() {
    if (this.flags.help) {
      console.log(`🚀 GSD Framework Installer
Usage: node setup-gsd.js [--force] [--dry-run] [--help]
Flags:
  --force      Overwrite existing files
  --dry-run    Preview changes
  --verbose    Detailed output
  --help       Show this help`);
      return;
    }

    console.log('🚀 GSD Framework Installer\n');

    try {
      // Detect project
      this.log('Detecting project...');
      if (!fs.existsSync('package.json') && !fs.existsSync('pyproject.toml') && !fs.existsSync('.git')) {
        throw new Error('Not a valid project directory');
      }
      this.log('Project detected', 'success');
      console.log('');

      // Create directories
      this.log('Creating directories...');
      const dirs = [
        '.planning',
        '.planning/phases',
        '.planning/phases/00-example',
        '.planning/codebase',
        '.planning/deferred-issues',
        'docs'
      ];

      for (const dir of dirs) {
        if (!this.flags.dryRun && !fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        this.log(`${this.flags.dryRun ? 'Would create' : 'Created'}: ${dir}`, 'success');
      }
      console.log('');

      // List next steps
      console.log('✅ GSD Framework structure created!\n');
      console.log('📚 Next Steps:');
      console.log('  1. Read docs/GSD-FRAMEWORK.md');
      console.log('  2. Copy .planning/phases/00-example to 01-your-phase');
      console.log('  3. Edit PHASE-REQUIREMENTS.md');
      console.log('  4. Tell Claude: "Create GSD plans for Phase 01"\n');

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  }
}

const installer = new GSDInstaller();
installer.run();
