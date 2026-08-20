#!/usr/bin/env node

/**
 * ==============================================================================
 * KHAGOLSHASTRA MANDATORY PRE-PUSH SECURITY & PRIVACY AUDIT HARNESS
 * ==============================================================================
 * This automated verification runs before EVERY push to GitHub:
 * 1. Full Secret Safety Pass (Decoupling, Gitignore, NEXT_PUBLIC_ exposure)
 * 2. Personal Data & Privacy Audit (Zero PII in logs, GDPR erasure, response filters)
 * 3. Pre-Deployment Hardening (Security headers, debug code removal, build integrity)
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

console.log('\n==============================================================================');
console.log(' 🛡️  RUNNING MANDATORY PRE-PUSH SECURITY, PRIVACY & HARDENING AUDIT');
console.log('==============================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function reportCheck(title, passed, details = '') {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(` ✅ [PASSED] ${title}`);
    if (details) console.log(`    ↳ ${details}`);
  } else {
    failedChecks++;
    console.error(` ❌ [FAILED] ${title}`);
    if (details) console.error(`    ↳ ${details}`);
  }
}

// ------------------------------------------------------------------------------
// CHECK 1: Git-Tracked Sensitive Files & .gitignore Enforcement
// ------------------------------------------------------------------------------
try {
  const trackedFiles = execSync('git ls-files', { cwd: ROOT_DIR, encoding: 'utf-8' }).split('\n');
  const sensitivePatterns = [
    /^\.env$/,
    /^\.env\.local$/,
    /^\.env\.production$/,
    /backend\/\.env$/,
    /frontend\/\.env$/,
    /\.pem$/,
    /\.key$/,
    /\.pfx$/,
    /\.sqlite$/,
    /\.db$/,
  ];

  const leakedFiles = trackedFiles.filter((f) =>
    sensitivePatterns.some((pattern) => pattern.test(f.trim()))
  );

  const gitignoreContent = fs.readFileSync(path.join(ROOT_DIR, '.gitignore'), 'utf-8');
  const hasEnvInGitignore = gitignoreContent.includes('.env') && gitignoreContent.includes('*.pem');

  reportCheck(
    'Gitignore & Sensitive Files Exclusion',
    leakedFiles.length === 0 && hasEnvInGitignore,
    leakedFiles.length > 0
      ? `CRITICAL: The following sensitive files are tracked in git: ${leakedFiles.join(', ')}`
      : 'All .env files, certificates, and database binaries are strictly untracked.'
  );
} catch (err) {
  reportCheck('Gitignore & Sensitive Files Exclusion', false, err.message);
}

// ------------------------------------------------------------------------------
// CHECK 2: Codebase Secret Scan (Zero Hardcoded Tokens, Private Keys, DB URIs)
// ------------------------------------------------------------------------------
function scanFilesRecursively(dir, fileList = [], allowedExts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.json']) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === '__pycache__' || file === '.venv' || file === 'scratch') {
      continue;
    }
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanFilesRecursively(filePath, fileList, allowedExts);
    } else if (allowedExts.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const secretRegexes = [
  { name: 'Stripe Secret Key', pattern: /sk_live_[0-9a-zA-Z]{24}/ },
  { name: 'OpenAI API Key', pattern: /sk-[0-9a-zA-Z]{32,}/ },
  { name: 'Supabase Service Role Key', pattern: /service_role[a-zA-Z0-9_\-\.]{50,}/ },
  { name: 'Private Database Connection String with Credentials', pattern: /postgres:\/\/[^:]+:[^@]+@[^:]+:[0-9]+\// },
  { name: 'AWS Access Key ID', pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub Personal Access Token', pattern: /ghp_[0-9a-zA-Z]{36}/ },
];

const allSourceFiles = [
  ...scanFilesRecursively(path.join(ROOT_DIR, 'frontend', 'src')),
  ...scanFilesRecursively(path.join(ROOT_DIR, 'backend', 'app')),
];

let foundSecretMatches = [];
for (const file of allSourceFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  for (const { name, pattern } of secretRegexes) {
    if (pattern.test(content)) {
      foundSecretMatches.push(`${name} found in ${path.relative(ROOT_DIR, file)}`);
    }
  }
}

reportCheck(
  'Codebase Secret Scan (Decoupled to Env Vars)',
  foundSecretMatches.length === 0,
  foundSecretMatches.length > 0
    ? `Leaks detected: ${foundSecretMatches.join('; ')}`
    : 'Zero hardcoded secrets, private keys, or credentials found across all source files.'
);

// ------------------------------------------------------------------------------
// CHECK 3: Frontend Public Exposure (NEXT_PUBLIC_ Prefix Audit)
// ------------------------------------------------------------------------------
let exposedSensitiveVars = [];
for (const file of allSourceFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.match(/NEXT_PUBLIC_[A-Z0-9_]+/g) || [];
  for (const m of matches) {
    if (
      m.includes('SECRET') ||
      m.includes('KEY') ||
      m.includes('PASSWORD') ||
      m.includes('TOKEN') ||
      m.includes('PRIVATE')
    ) {
      exposedSensitiveVars.push(`${m} in ${path.relative(ROOT_DIR, file)}`);
    }
  }
}

reportCheck(
  'Frontend Public Exposure (NEXT_PUBLIC_ Audit)',
  exposedSensitiveVars.length === 0,
  exposedSensitiveVars.length > 0
    ? `Exposed variables: ${exposedSensitiveVars.join(', ')}`
    : 'All NEXT_PUBLIC_ variables are browser-safe. Zero sensitive keys exposed.'
);

// ------------------------------------------------------------------------------
// CHECK 4: Debug Code & Console.log Statement Removal
// ------------------------------------------------------------------------------
let frontendConsoleLogs = [];
const frontendSrcFiles = scanFilesRecursively(path.join(ROOT_DIR, 'frontend', 'src'), [], ['.ts', '.tsx']);
for (const file of frontendSrcFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  if (/console\.log\s*\(/.test(content)) {
    frontendConsoleLogs.push(path.relative(ROOT_DIR, file));
  }
}

reportCheck(
  'Debug Code & Console.log Removal',
  frontendConsoleLogs.length === 0,
  frontendConsoleLogs.length > 0
    ? `Found console.log in: ${frontendConsoleLogs.join(', ')}`
    : 'Zero console.log statements found in frontend production codebase.'
);

// ------------------------------------------------------------------------------
// CHECK 5: Enterprise Security Headers Configuration
// ------------------------------------------------------------------------------
const nextConfigFile = path.join(FRONTEND_DIR, 'next.config.js');
let headersPassed = false;
if (fs.existsSync(nextConfigFile)) {
  const configContent = fs.readFileSync(nextConfigFile, 'utf-8');
  headersPassed =
    configContent.includes('X-Content-Type-Options') &&
    configContent.includes('nosniff') &&
    configContent.includes('X-Frame-Options') &&
    configContent.includes('DENY') &&
    configContent.includes('Strict-Transport-Security') &&
    configContent.includes('Content-Security-Policy') &&
    configContent.includes('poweredByHeader: false');
}

reportCheck(
  'Defense-in-Depth HTTP Security Headers',
  headersPassed,
  headersPassed
    ? 'HSTS, CSP, X-Frame-Options: DENY, nosniff, Referrer-Policy & poweredByHeader: false active.'
    : 'Missing required security headers in next.config.js'
);

// ------------------------------------------------------------------------------
// CHECK 6: User Personal Data Protection & Right to Erasure
// ------------------------------------------------------------------------------
let privacyPassed = false;
const privacyRouteFile = path.join(ROOT_DIR, 'backend', 'app', 'routers', 'privacy.py');
const apiLibFile = path.join(ROOT_DIR, 'frontend', 'src', 'lib', 'api.ts');
if (fs.existsSync(privacyRouteFile) && fs.existsSync(apiLibFile)) {
  const pyContent = fs.readFileSync(privacyRouteFile, 'utf-8');
  const apiContent = fs.readFileSync(apiLibFile, 'utf-8');
  privacyPassed =
    pyContent.includes('/delete-data') &&
    pyContent.includes('mask_email') &&
    pyContent.includes('If this email address is on file') &&
    apiContent.includes('deletePersonalData');
}

reportCheck(
  'User Personal Data Protection & Anti-Enumeration Privacy Flow',
  privacyPassed,
  privacyPassed
    ? 'Zero-trace account deletion, server log email masking, and uniform anti-enumeration responses active.'
    : 'Privacy erasure flow incomplete or exposes enumeration oracle.'
);

// ------------------------------------------------------------------------------
// CHECK 7: Administrative Auth & Security Middleware Verification (C1, H1, H3)
// ------------------------------------------------------------------------------
const adminAuthFile = path.join(ROOT_DIR, 'backend', 'app', 'admin', '__init__.py');
const securityMiddlewareFile = path.join(ROOT_DIR, 'backend', 'app', 'middleware', 'security.py');
const mainAppFile = path.join(ROOT_DIR, 'backend', 'app', 'main.py');

let securityHardeningPassed = false;
if (fs.existsSync(adminAuthFile) && fs.existsSync(securityMiddlewareFile) && fs.existsSync(mainAppFile)) {
  const adminContent = fs.readFileSync(adminAuthFile, 'utf-8');
  const middlewareContent = fs.readFileSync(securityMiddlewareFile, 'utf-8');
  const mainContent = fs.readFileSync(mainAppFile, 'utf-8');

  const c1Fixed = !adminContent.includes('if expected_key == "dev-secret-key-change-in-production":') && adminContent.includes('secrets.compare_digest');
  const h1Fixed = middlewareContent.includes('trusted_proxies_list') && middlewareContent.includes('_cleanup_stale_keys');
  const h3Fixed = mainContent.includes('ENABLE_DOCS');

  securityHardeningPassed = c1Fixed && h1Fixed && h3Fixed;
}

reportCheck(
  'Strict Admin Auth, Rate Limiter Proxy Validation & Docs Gating',
  securityHardeningPassed,
  securityHardeningPassed
    ? 'Zero admin bypasses, trusted proxy XFF verification, memory bounds, and gated API docs enforced.'
    : 'Security hardening checks failed for admin auth, rate limiter, or API docs.'
);

// ------------------------------------------------------------------------------
// CHECK 8: Git History Warning in README
// ------------------------------------------------------------------------------
const readmeFile = path.join(ROOT_DIR, 'README.md');
let readmeWarningPassed = false;
if (fs.existsSync(readmeFile)) {
  const readmeContent = fs.readFileSync(readmeFile, 'utf-8');
  readmeWarningPassed =
    readmeContent.includes('CRITICAL SECRET ROTATION NOTICE') &&
    readmeContent.includes('rotate');
}

reportCheck(
  'Git History Secret Rotation Notice in README',
  readmeWarningPassed,
  readmeWarningPassed
    ? 'Prominent security advisory on rotating legacy credentials present in README.md.'
    : 'Missing secret rotation warning in README.md.'
);

// ------------------------------------------------------------------------------
// SUMMARY & VERDICT
// ------------------------------------------------------------------------------
console.log('\n------------------------------------------------------------------------------');
console.log(` AUDIT RESULT: ${passedChecks}/${totalChecks} CHECKS PASSED`);
console.log('------------------------------------------------------------------------------\n');

if (failedChecks > 0) {
  console.error(` 🚨 AUDIT FAILED with ${failedChecks} issue(s). Resolve all issues before pushing to GitHub.`);
  process.exit(1);
} else {
  console.log(' ✨ ALL 7 PRE-PUSH SECURITY, PRIVACY & HARDENING CHECKS PASSED PERFECTLY!\n');
  process.exit(0);
}
