/**
 * Production entry point — boots the Express API (and serves the built SPA in production).
 */
const path = require('path');

const backendDir = path.join(__dirname, 'backend');
process.chdir(backendDir);
require(path.join(backendDir, 'index.js'));
