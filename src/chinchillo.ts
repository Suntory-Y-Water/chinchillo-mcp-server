// チンチロの役と配当率を定義する型
type Role = {
  name: string;
  multiplier: number;
};

// チンチロの役の定義
const ROLES = {
  PINZORO: { name: 'ピンゾロ', multiplier: 5 },
  ARASHI: { name: 'アラシ', multiplier: 3 },
  SHIGORO: { name: 'シゴロ', multiplier: 2 },
  NORMAL: { name: '通常役', multiplier: 1 },
  NOTHING: { name: '役なし', multiplier: -1 },
  HIFUMI: { name: 'ヒフミ', multiplier: -2 },
};

// ダイスの結果を表す型
type DiceResult = {
  dice: number[];
  role: Role;
  uniqueValue?: number; // 通常役の場合、一致していない目の値
};

// ダイスを振る過程を記録する型
type RollHistory = {
  attempt: number;
  dice: number[];
  role: Role;
};

/**
 * 3つのダイスをランダムに降った結果を返す。
 * 返すときは昇順にソートして判定しやすくする
 * @returns 3つのダイスの出目の配列 (各要素は1-6の整数)
 */
export function rollDice(): number[] {
  return Array(3)
    .fill(0)
    .map(() => Math.floor(Math.random() * 6) + 1)
    .sort((a, b) => a - b);
}

/**
 * ダイスの出目から役を判定する
 * @param dice ダイスの出目の配列 (ソート済み)
 * @returns 判定された役と関連情報
 */
function judgeRole(dice: number[]): DiceResult {
  // ダイスはすでにソート済みとする

  // ピンゾロ (1-1-1)
  if (dice[0] === 1 && dice[1] === 1 && dice[2] === 1) {
    return { dice, role: ROLES.PINZORO };
  }

  // ゾロ目 (同じ数字が3つ、ただしピンゾロを除く)
  if (dice[0] === dice[1] && dice[1] === dice[2] && dice[0] !== 1) {
    return { dice, role: ROLES.ARASHI };
  }

  // シゴロ (4-5-6)
  if (dice[0] === 4 && dice[1] === 5 && dice[2] === 6) {
    return { dice, role: ROLES.SHIGORO };
  }

  // ヒフミ (1-2-3)
  if (dice[0] === 1 && dice[1] === 2 && dice[2] === 3) {
    return { dice, role: ROLES.HIFUMI };
  }

  // 通常役 (同じ数字が2つ)
  if (dice[0] === dice[1] || dice[1] === dice[2]) {
    // 一致していない目の値を取得
    const uniqueValue = dice[0] === dice[1] ? dice[2] : dice[0];
    return { dice, role: ROLES.NORMAL, uniqueValue };
  }

  // 役なし
  return { dice, role: ROLES.NOTHING };
}

/**
 * 2つの役の勝敗を判定する
 * @param result1 プレイヤー1の結果
 * @param result2 プレイヤー2の結果
 * @returns 勝者: 1ならプレイヤー1の勝ち、2ならプレイヤー2の勝ち、0なら引き分け
 */
function judgeWinner(result1: DiceResult, result2: DiceResult): number {
  // 配当率が高い方が勝ち
  if (result1.role.multiplier > result2.role.multiplier) {
    return 1;
  }
  if (result1.role.multiplier < result2.role.multiplier) {
    return 2;
  }

  // 配当率が同じ場合
  // アラシ同士の場合は数値が大きい方が勝ち
  if (result1.role === ROLES.ARASHI && result2.role === ROLES.ARASHI) {
    // アラシは3つとも同じ目なので、ダイスの値はすべて同じ
    // 配列の中身を確認してから比較
    const dice1 = result1.dice;
    const dice2 = result2.dice;

    if (dice1 && dice1.length > 0 && dice2 && dice2.length > 0) {
      // 配列の要素が存在することを確認
      const value1 = dice1[0];
      const value2 = dice2[0];

      if (typeof value1 === 'number' && typeof value2 === 'number') {
        if (value1 > value2) {
          return 1;
        }
        if (value1 < value2) {
          return 2;
        }
      }
    }
    return 0; // 完全に同じ場合は引き分け
  }

  // 通常役同士の場合（両方とも通常役の場合のみ）一致していない目の大きい方が勝ち
  if (result1.role === ROLES.NORMAL && result2.role === ROLES.NORMAL) {
    if (result1.uniqueValue && result2.uniqueValue) {
      if (result1.uniqueValue > result2.uniqueValue) {
        return 1;
      }
      if (result1.uniqueValue < result2.uniqueValue) {
        return 2;
      }
    }
  }

  // それ以外は引き分け
  return 0;
}

/**
 * 指定された回数だけダイスを振り直して、最も良い結果を返す
 * チンチロのルールに従い、役なしの場合のみ上限回数まで振り直し可能
 * 役なし以外が出た時点で確定する
 * @param maxRolls 振り直し可能な最大回数
 * @returns 最適な結果と振る過程の履歴
 */
function rollWithRerolls(maxRolls: number): {
  bestResult: DiceResult;
  history: RollHistory[];
} {
  // 少なくとも1回はダイスを振る
  let dice = rollDice();
  let result = judgeRole(dice);

  // 履歴を記録
  const history: RollHistory[] = [
    {
      attempt: 1,
      dice: [...dice],
      role: result.role,
    },
  ];

  // 役なしの場合のみ振り直し、役なし以外が出た時点で確定
  let currentRoll = 1;
  while (currentRoll < maxRolls && result.role === ROLES.NOTHING) {
    currentRoll++;
    dice = rollDice();
    result = judgeRole(dice);

    history.push({
      attempt: currentRoll,
      dice: [...dice],
      role: result.role,
    });
  }

  // 最後の結果を返す
  return {
    bestResult: result,
    history,
  };
}

/**
 * チンチロゲームを実行する
 * @param userRolls ユーザーが振り直せる回数
 * @param computerRolls コンピュータが振り直せる回数 (デフォルト: 1)
 * @returns ゲーム結果の詳細
 */
export function playChinchillo(rollCount: number): {
  userFirst: boolean;
  userResult: DiceResult;
  computerResult: DiceResult;
  winner: number;
  description: string;
  userHistory: RollHistory[];
  computerHistory: RollHistory[];
} {
  // 先行後攻をランダムで決定
  const userFirst = Math.random() < 0.5;

  // ユーザーとコンピュータのダイスを振る
  const userRollResult = rollWithRerolls(rollCount);
  const computerRollResult = rollWithRerolls(rollCount);

  const userResult = userRollResult.bestResult;
  const computerResult = computerRollResult.bestResult;

  // 勝敗判定
  const winner = judgeWinner(userResult, computerResult);

  // 結果のナレーションを生成
  let description = '🎲 チンチロ勝負開始！ 🎲\n\n';

  // 先行の振り
  const firstPlayer = userFirst ? 'あなた' : 'コンピュータ';
  const firstHistory = userFirst ? userRollResult.history : computerRollResult.history;

  description += `==== ${firstPlayer}の番 ====\n`;
  firstHistory.forEach((roll, index) => {
    description += `${index + 1}回目: ${roll.dice.join('-')} ... ${roll.role.name}`;
    if (index < firstHistory.length - 1) {
      description += ' ... もう一度振ります！\n';
    } else {
      description += ' が確定！\n';
    }
  });

  description += '\n';

  // 後攻の振り
  const secondPlayer = userFirst ? 'コンピュータ' : 'あなた';
  const secondHistory = userFirst ? computerRollResult.history : userRollResult.history;

  description += `==== ${secondPlayer}の番 ====\n`;
  secondHistory.forEach((roll, index) => {
    description += `${index + 1}回目: ${roll.dice.join('-')} ... ${roll.role.name}`;
    if (index < secondHistory.length - 1) {
      description += ' ... もう一度振ります！\n';
    } else {
      description += ' が確定！\n';
    }
  });

  description += '\n==== 結果発表 ====\n';
  description += `あなたの役: ${userResult.role.name} (${userResult.dice.join('-')})`;
  if (userResult.role === ROLES.NORMAL && userResult.uniqueValue) {
    description += ` (目: ${userResult.uniqueValue})`;
  }
  description += '\n';

  description += `コンピュータの役: ${computerResult.role.name} (${computerResult.dice.join('-')})`;
  if (computerResult.role === ROLES.NORMAL && computerResult.uniqueValue) {
    description += ` (目: ${computerResult.uniqueValue})`;
  }
  description += '\n\n';

  // 勝敗結果
  if (winner === 1) {
    description += `🎉 あなたの勝ちです！ (${userResult.role.multiplier > 0 ? '+' : ''}${userResult.role.multiplier}倍)`;
  } else if (winner === 2) {
    description += `😢 コンピュータの勝ちです。 (${computerResult.role.multiplier > 0 ? '+' : ''}${computerResult.role.multiplier}倍)`;
  } else {
    description += '🤝 引き分けです。';
  }

  return {
    userFirst,
    userResult,
    computerResult,
    winner,
    description,
    userHistory: userRollResult.history,
    computerHistory: computerRollResult.history,
  };
}
