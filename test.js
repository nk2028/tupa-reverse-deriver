// @ts-check

const 拼音反推 = require('./index');

const { loadQieyun, loadUnt } = require('./loader');

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
  let runCount = 0;
  for await (const { 地位: std, 拼音 } of iter) {
    runCount++;
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
      `${errCount}${errCount === errLimit ? '+' : ''}/${runCount}${
        errCount === errLimit ? '+' : ''
      } testo(j) malsukcesa(j)`,
    );
    return false;
  } else {
    console.log(`Ĉiuj ${runCount} testoj estas sukcesaj.`);
    return true;
  }
}

function testInvalid() {
  /** @type {[string, string | RegExp][]} */
  const data = [
    ['ngiox', /【提示：上聲用 -q】/],
    ['ngioq', /【提示：用鈍介音 y\/u】/],
    ['ngyan', /【提示：元韻為 y\/uon】/],
    ['qow', /無法識別韻基.*【提示：侯韻為 ou】/],
    ['qai', /無法識別韻母.*【提示：切韻拼音用 -j -w 尾】/],
    ['tshryet', /無法識別聲母.*【提示：初母為 tsrh】/],
    ['cyang', /【提示：精母為 ts、章母為 tj】/],
    ['kyung', /不合法介音搭配.*【提示：三等 u 不需介音】/],
    ['pwan', /不合法脣音字拼寫/],
    ['tryin', /莊組以外銳音聲母不可配B類/],
    ['wuo', /無法識別聲母.*【提示：云母不寫】/],
  ];

  let errCount = 0;
  for (const [拼音, expected] of data) {
    try {
      const res = 拼音反推(拼音);
      errCount++;
      console.log(`${拼音}: Erarenda, sed ${res.描述} liverita`);
    } catch (e) {
      if (e.message.search(expected) === -1) {
        console.log(`${拼音}: Erarmesaĝo ne enhavas \`${expected}':`, e);
        errCount++;
      }
    }
  }

  if (errCount > 0) {
    console.log(`${errCount}/${data.length} testo(j) malsukcesa(j)`);
  } else {
    console.log(`Ĉiuj ${data.length} testoj estas sukcesaj.`);
  }

  return errCount === 0;
}

//console.log('#', 拼音反推('uinh').描述);

(async () => {
  let success = true;
  console.log('Testoj de datumoj de unt');
  success = (await runTestOn(loadUnt())) && success;

  console.log();
  console.log('Testoj de Qieyun.iter音韻地位()');
  success = (await runTestOn(loadQieyun(), 2)) && success;

  console.log();
  console.log('Testoj de nevalidaj latinigoj');
  success = testInvalid() && success;

  process.exit(success ? 0 : 1);
})();
