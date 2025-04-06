import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { describe, expect, it } from 'vitest';
import { server } from './server.js';

describe('getDiceRoll', () => {
  it('チンチロを実行する', async () => {
    // テスト用クライアントの作成
    const client = new Client({
      name: 'test client',
      version: '1.0.0',
    });

    // インメモリ通信チャネルの作成
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    // クライアントとサーバーを接続
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);

    // 6面サイコロを振る
    const result = await client.callTool({
      name: 'getDiceRoll',
      arguments: {
        count: 3,
      },
    });

    // チンチロの結果を確認
    // 返却されればOKとする
    expect(result).toBeDefined();
  });
});
