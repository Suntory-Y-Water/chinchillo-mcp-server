import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { v4 as uuidv4 } from 'uuid';

async function main() {
  // serverを初期化する
  const server = new McpServer({
    name: 'uuid-mcp-server-example',
    version: '1.0.0',
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  // ツール一覧要求が来たときに応答するハンドラを登録する
  server.tool('generate_uuid', async () => {
    return {
      content: [
        {
          type: 'text',
          text: uuidv4(),
        },
      ],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Weather MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
