import 拼音反推 from './index.js';

import { loadQieyun, loadUnt } from './loader.js';

async function runTestOn(iter, 不規則地位, errLimit = 30, throwOnly = false) {
  let errCount = 0;
  for await (const { 地位: std, 拼音, 字頭 } of iter) {
    try {
      const res = 拼音反推(拼音, 不規則地位);
      let correct = res.等於(std);
      if (
        不規則地位 &&
        std.屬於('崇母 開口 眞臻韻 入聲') &&
        res.屬於('崇母 開口 眞臻韻 入聲')
      ) {
        correct = true;
      }
      if (!throwOnly && !correct) {
        console.log(std.描述, 拼音);
        console.log('  Eraro:', res.描述);
        errCount += 1;
      }
    } catch (e) {
      console.log(std.描述, 拼音);
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
    return false;
  } else {
    console.log('Ĉiuj testoj estas sukcesaj');
    return true;
  }
}

//console.log('#', 拼音反推('uinh').描述);

console.log('Testoj de Qieyun.iter音韻地位()');
await runTestOn(loadQieyun(), true);

console.log();
console.log('Testoj de datumoj de unt');
await runTestOn(loadUnt(), false);
