import * as fs from 'fs';
import * as readline from 'readline';

import Qieyun from 'qieyun';

export async function* loadUnt() {
  const fin = fs.createReadStream('data-unt.txt');
  const rl = readline.createInterface({
    input: fin,
    crlfDelay: Infinity,
  });
  let row = 0;
  for await (const line of rl) {
    row++;
    if (row <= 1) {
      continue;
    }
    const fields = line.trim().split(/\s+/);
    if (fields[2] === '(deleted)') {
      continue;
    }
    const 地位 = Qieyun.音韻地位.from編碼(fields[2]);
    yield {
      地位,
      字頭: fields[1],
      拼音: fields[3],
    };
  }
}

// TODO 特殊字頭測試
export function* loadQieyun() {
  for (const 地位 of Qieyun.iter音韻地位()) {
    yield {
      地位,
      拼音: tshet(地位, 地位.代表字, {
        脣音咍韻歸灰韻: true,
      }),
      字頭: 地位.代表字,
    };
  }
}

const tshet = Function(
  '音韻地位',
  '字頭',
  '選項',
  fs.readFileSync('tshet.js').toString(),
);
