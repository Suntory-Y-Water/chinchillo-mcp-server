#!/usr/bin/env node

import { main } from './server.js';

main().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
