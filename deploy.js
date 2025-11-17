#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

// Configuration
const DOMAIN = 'skdool.surge.sh';
const BUILD_DIR = 'dist';

function checkSurgeInstalled() {
  try {
    execSync('surge --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function installSurge() {
  log.warn('Surge CLI is not installed.');
  log.info('Installing Surge CLI globally...');
  try {
    execSync('npm install -g surge', { stdio: 'inherit' });
    log.success('Surge CLI installed successfully!');
    return true;
  } catch (error) {
    log.error('Failed to install Surge CLI. Please install it manually: npm install -g surge');
    return false;
  }
}

function buildProject() {
  log.info('Building project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    log.success('Build completed successfully!');
    return true;
  } catch (error) {
    log.error('Build failed. Please fix the errors and try again.');
    return false;
  }
}

function ensureCNAME() {
  const cnamePath = path.join(BUILD_DIR, 'CNAME');
  if (!fs.existsSync(cnamePath)) {
    log.info('Creating CNAME file...');
    fs.writeFileSync(cnamePath, DOMAIN);
    log.success('CNAME file created.');
  }
}

function deploy() {
  log.info(`Deploying to Surge (${DOMAIN})...`);
  try {
    execSync(`surge ${BUILD_DIR} ${DOMAIN}`, { stdio: 'inherit' });
    log.success('Deployment successful!');
    console.log(`\n${colors.green}🌐 Your site is live at: https://${DOMAIN}${colors.reset}\n`);
    return true;
  } catch (error) {
    log.error('Deployment failed.');
    return false;
  }
}

// Main deployment flow
async function main() {
  console.log(`${colors.blue}🚀 Starting deployment to Surge...${colors.reset}\n`);

  // Check if surge is installed
  if (!checkSurgeInstalled()) {
    if (!installSurge()) {
      process.exit(1);
    }
  }

  // Build the project
  if (!buildProject()) {
    process.exit(1);
  }

  // Check if dist directory exists
  if (!fs.existsSync(BUILD_DIR)) {
    log.error(`Build directory '${BUILD_DIR}' not found.`);
    process.exit(1);
  }

  // Ensure CNAME file exists
  ensureCNAME();

  // Deploy to Surge
  if (!deploy()) {
    process.exit(1);
  }
}

main();

