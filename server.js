/**
 * Render Bootstrapper
 * This file redirects the execution to the backend/index.js entry point.
 */
const path = require('path');
process.chdir(path.join(__dirname, 'backend'));
require('./backend/index.js');
