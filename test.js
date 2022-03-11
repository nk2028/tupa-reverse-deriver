// @ts-check

import 拼音反推 from './index.js';

import { loadQieyun, loadUnt } from './loader.js';

/**
 * @typedef {object} Item
 * @property {import("qieyun").音韻地位} 地位
 * @property {string} 拼音
 * @property {string} 字頭
 */

/**
 * @param {AsyncIterable<Item> | Iterable<Item>} iter
 * @param {number} 不規則小韻
 */
async function runTestOn(
  iter,
  不規則小韻 = 1,
  errLimit = 30,
  throwOnly = false,
) {
  let errCount = 0;
  for await (const { 地位: std, 拼音, 字頭 } of iter) {
    try {
      const res = 拼音反推(拼音, 不規則小韻);
      let correct = res.等於(std);
      if (
        不規則小韻 &&
        std.屬於('崇母 開口 眞臻韻 入聲') &&
        res.屬於('崇母 開口 眞臻韻 入聲')
      ) {
        // 「𪗨」小韻於兩韻重出，實質全同，推為哪個均算正確
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

// XXX 測試非法拼寫

(async () => {
  console.log('Testoj de datumoj de unt');
  await runTestOn(loadUnt());

  console.log();
  console.log('Testoj de Qieyun.iter音韻地位()');
  await runTestOn(loadQieyun(), 2);
})();
