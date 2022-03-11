import 拼音反推 from './index.js';

import * as fs from 'fs';

import Qieyun from 'qieyun';

const tshet = Function(
  '音韻地位',
  '字頭',
  '選項',
  fs.readFileSync('tshet.js').toString(),
);

//console.log('#', 拼音反推('uinh').描述);

// TODO 特殊字頭測試
const throwOnly = false;
const errLimit = 30;
let errCount = 0;
for (const std of Qieyun.iter音韻地位()) {
  const latinigo = tshet(std, std.代表字, {
    脣音咍韻歸灰韻: true,
  });
  try {
    const res = 拼音反推(latinigo, true);
    let correct = res.等於(std);
    if (
      std.屬於('崇母 開口 眞臻韻 入聲') &&
      res.屬於('崇母 開口 眞臻韻 入聲')
    ) {
      correct = true;
    }
    if (!throwOnly && !correct) {
      console.log(std.描述, latinigo);
      console.log('  Eraro:', res.描述);
      errCount += 1;
    }
  } catch (e) {
    console.log(std.描述, latinigo);
    console.log(e);
    errCount += 1;
  }
  if (errCount >= errLimit) {
    console.log(`Interrompita pro tro da eraroj`);
    break;
  }
}
if (errCount) {
  console.log(
    `${errCount}${errCount === errLimit ? '+' : ''} testo(j) malsukcesa(j)`,
  );
  process.exit(1);
} else {
  console.log('Ĉiuj testoj estas sukcesaj');
}
