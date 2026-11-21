#!/usr/bin/env node
// stdout carries MCP protocol messages only; diagnostics go to stderr.
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer, defaultDeps } from './server.js';

const deps = defaultDeps();

serveStdio(() => createServer(deps), {
  onerror: (error) => console.error('gta6-mcp:', error.message),
});
