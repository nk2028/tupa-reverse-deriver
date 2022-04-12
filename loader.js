// @ts-check

const fs = require('fs');
const readline = require('readline');

const Qieyun = require('qieyun');
global.Qieyun = Qieyun;

exports.loadQieyun = function* loadQieyun() {
  for (const 地位 of Qieyun.資料.iter音韻地位()) {
    const 字頭 = Qieyun.資料.query音韻地位(地位)[0].字頭;
    const 拼音 = tupa(地位);
    yield { 地位, 字頭, 拼音 };
  }
};

exports.loadV2 = async function* loadV2() {
  const fin = fs.createReadStream('data/v2音韻地位.csv');
  const rl = readline.createInterface({
    input: fin,
    crlfDelay: Infinity,
  });
  let rowNum = 0;
  for await (const line of rl) {
    rowNum++;
    if (rowNum <= 1) {
      continue;
    }
    const [, 地位str, 字頭str, , 拼音str] = line.trimEnd().split(',');
    if (地位str === '(deleted)') {
      continue;
    }
    const 地位s = 地位str.split('/');
    const 字頭s = 字頭str.split('/');
    const 拼音s = 拼音str.split('/');
    for (let i = 0; i < 地位s.length; i++) {
      const 地位 = Qieyun.音韻地位.from描述(地位s[i]);
      const 拼音 = tupa(地位);
      if (拼音 !== 拼音s[i]) {
        console.log(`Averto: derivita ${拼音} != ${拼音s[i]}`);
      }
      yield {
        地位,
        字頭: 字頭s[i],
        拼音: 拼音s[i],
      };
    }
  }
};

const tupa = Qieyun.推導方案.建立(
  /** @type {Qieyun.推導方案.原始推導函數<string>} */ (
    new Function(
      '音韻地位',
      '字頭',
      '選項',
      fs.readFileSync('data/tupa.js').toString(),
    )
  ),
);
