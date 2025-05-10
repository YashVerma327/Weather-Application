// Windows-compatible starter script (ES Module version)
import { execSync } from 'child_process';
import 'dotenv/config';

// Set environment variables
process.env.NODE_ENV = 'development';

// Add these database connection and API key lines
process.env.DATABASE_URL = 'postgres://postgres:1234@localhost:5432/weatherapp';
process.env.OPENWEATHER_API_KEY = 'b637ffd575f2c6aaa549587dc8899e6d';
process.env.VITE_OPENWEATHER_API_KEY = 'b637ffd575f2c6aaa549587dc8899e6d';

console.log('Starting server in development mode...');

try {
  // Use direct node command
  execSync('node node_modules/tsx/dist/cli.mjs server/indexWindows.ts', {
    stdio: 'inherit',
    env: process.env  // This passes all environment variables to the child process
  });
} catch (error) {
  console.error('Error starting server:', error);
}