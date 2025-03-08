import { MCPServer } from './server/MCPServer.js';

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 0 && args[0].includes('index.js')) {
    // If the first argument contains 'index.js', it's likely the script path
    // Remove it from the arguments
    process.argv = [process.argv[0], process.argv[1], ...args.slice(1)];
  }

  const server = new MCPServer();
  await server.start();
}

main().catch(error => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
