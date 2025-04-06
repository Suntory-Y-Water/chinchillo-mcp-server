import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { playChinchillo, rollDice } from './chinchillo.js';

// rollDice関数をモック化するための設定
vi.mock('./chinchillo.js', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('./chinchillo.js');
  return {
    ...actual,
    rollDice: vi.fn(),
  };
});

describe('チンチロゲーム', () => {
  // テスト前後の処理
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('リロール機能', () => {
    test('役なしの場合のみリロールすること', () => {
      // 1回目: 役なし、2回目: 通常役
      vi.mocked(rollDice)
        .mockReturnValueOnce([1, 3, 5]) // 役なし
        .mockReturnValueOnce([2, 2, 5]); // 通常役

      const result = playChinchillo(3);

      expect(result.userHistory.length).toBe(2);
      if (result.userHistory.length >= 2) {
        expect(result.userHistory[0]?.dice).toEqual([1, 3, 5]);
        expect(result.userHistory[0]?.role.name).toBe('役なし');
        expect(result.userHistory[1]?.dice).toEqual([2, 2, 5]);
        expect(result.userHistory[1]?.role.name).toBe('通常役');
      }
    });

    test('最初から役が出た場合はリロールしないこと', () => {
      vi.mocked(rollDice).mockReturnValueOnce([2, 2, 5]); // 通常役

      const result = playChinchillo(3);

      expect(result.userHistory.length).toBe(1);
      if (result.userHistory.length >= 1) {
        expect(result.userHistory[0]?.dice).toEqual([2, 2, 5]);
        expect(result.userHistory[0]?.role.name).toBe('通常役');
      }
    });

    test('最大リロール回数を超えないこと', () => {
      // すべて役なし
      vi.mocked(rollDice)
        .mockReturnValueOnce([1, 3, 5])
        .mockReturnValueOnce([2, 4, 6])
        .mockReturnValueOnce([1, 4, 6]);

      const result = playChinchillo(2);

      expect(result.userHistory.length).toBe(2);
      expect(result.userHistory[0]?.dice).toEqual([1, 3, 5]);
      expect(result.userHistory[0]?.role.name).toBe('役なし');
      expect(result.userHistory[1]?.dice).toEqual([2, 4, 6]);
      expect(result.userHistory[1]?.role.name).toBe('役なし');
    });
  });

  describe('勝敗判定', () => {
    test('ユーザーの役の方が強い場合はユーザーの勝ち', () => {
      // ユーザー: ピンゾロ (5倍)、コンピュータ: アラシ (3倍)
      vi.mocked(rollDice)
        .mockReturnValueOnce([1, 1, 1]) // ユーザー: ピンゾロ
        .mockReturnValueOnce([3, 3, 3]); // コンピュータ: アラシ

      const result = playChinchillo(1);

      expect(result.winner).toBe(1); // ユーザーの勝ち
      expect(result.description).toContain('あなたの勝ちです！');
    });

    test('コンピュータの役の方が強い場合はコンピュータの勝ち', () => {
      // ユーザー: 通常役 (1倍)、コンピュータ: シゴロ (2倍)
      vi.mocked(rollDice)
        .mockReturnValueOnce([2, 2, 5]) // ユーザー: 通常役
        .mockReturnValueOnce([4, 5, 6]); // コンピュータ: シゴロ

      const result = playChinchillo(1);

      expect(result.winner).toBe(2); // コンピュータの勝ち
      expect(result.description).toContain('コンピュータの勝ちです');
    });

    test('同じ役の場合 (通常役) は目の大きい方が勝ち', () => {
      // ユーザー: 通常役 (2-2-6)、コンピュータ: 通常役 (3-3-5)
      vi.mocked(rollDice)
        .mockReturnValueOnce([2, 2, 6]) // ユーザー: 通常役、目6
        .mockReturnValueOnce([3, 3, 5]); // コンピュータ: 通常役、目5

      const result = playChinchillo(1);

      expect(result.winner).toBe(1); // ユーザーの勝ち (目が大きいため)
      expect(result.description).toContain('あなたの勝ちです！');
    });

    test('同じ役・同じ目の場合は引き分け', () => {
      // ユーザー: 通常役 (4-4-6)、コンピュータ: 通常役 (2-2-6)
      vi.mocked(rollDice)
        .mockReturnValueOnce([4, 4, 6]) // ユーザー: 通常役、目6
        .mockReturnValueOnce([2, 2, 6]); // コンピュータ: 通常役、目6

      const result = playChinchillo(1);

      expect(result.winner).toBe(0); // 引き分け
      expect(result.description).toContain('引き分けです');
    });

    test('アラシ同士の場合は数値が大きい方が勝ち', () => {
      // ユーザー: アラシ (5-5-5)、コンピュータ: アラシ (2-2-2)
      vi.mocked(rollDice)
        .mockReturnValueOnce([5, 5, 5]) // ユーザー: アラシ 5
        .mockReturnValueOnce([2, 2, 2]); // コンピュータ: アラシ 2

      const result = playChinchillo(1);

      expect(result.winner).toBe(1); // ユーザーの勝ち (数値が大きいため)
      expect(result.description).toContain('あなたの勝ちです！');
    });

    test('アラシ同士で同じ数値の場合は引き分け', () => {
      // ユーザー: アラシ (4-4-4)、コンピュータ: アラシ (4-4-4)
      vi.mocked(rollDice)
        .mockReturnValueOnce([4, 4, 4]) // ユーザー: アラシ 4
        .mockReturnValueOnce([4, 4, 4]); // コンピュータ: アラシ 4

      const result = playChinchillo(1);

      expect(result.winner).toBe(0); // 引き分け
      expect(result.description).toContain('引き分けです');
    });
  });
});
