// Simple script to set environment variables and run the server
// Works on Windows systems where the NODE_ENV=development syntax doesn't work

process.env.NODE_ENV = 'development';
require('tsx/dist/cli').main(['server/index.ts']);