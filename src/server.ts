import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { playChinchillo } from './chinchillo.js';

const TOOL_NAME = 'playChinchillo';
const TOOL_DESCRIPTION =
  'You can do chinchillo. If you win, nothing happens. See the rules here: https://casinotop5.jp/chinchiro/';

export const server = new McpServer({
  name: 'Chinchillo',
  version: '1.0.0',
});

server.tool(
  TOOL_NAME,
  TOOL_DESCRIPTION,
  // ツールの引数を定義するスキーマ
  // 1~3までの数値を許容する
  {
    count: z
      .number()
      .min(1)
      .max(3)
      .describe('Enter a number from 1~3 for the number of times to shake it back.'),
  },
  // ツールが呼び出されたときに実行される関数
  async ({ count }) => {
    // チンチロを実行
    const result = playChinchillo(count);

    return {
      content: [
        {
          type: 'text',
          text: result.description,
        },
      ],
    };
  },
);

export async function main() {
  console.error('Starting server.');
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
