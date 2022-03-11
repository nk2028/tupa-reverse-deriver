// @ts-check

import Qieyun from 'qieyun';

/**
 * @param {string} 音節
 * @returns {Qieyun.音韻地位}
 */
export function 拼音反推(音節, 反推不規則地位 = false) {
  // 特別允許的例外拼寫，跳過常規分析
  switch (音節) {
    case 'biangq':
      return new Qieyun.音韻地位('並', null, '三', null, '陽', '上');
  }

  // 分解音節
  let [母, 聲, 韻母] = split音節(音節);
  const [介, 主, 尾] = split韻母(韻母, 音節);

  // 分析介音
  if (!['', 'y', 'u', 'i', 'wi', 'w'].includes(介)) {
    throw new Error(`不合法介音 ${介} (${音節})`);
  }
  const 合介音 = /^[wu]/.test(介) ? 介.slice(0, 1) : null;
  const 三等介音 = /[iyu]$/.test(介) ? 介.slice(-1) : null;

  function throw介音搭配() {
    throw new Error(`不合法介音搭配 ${介}-${主} ($${音節})`);
  }

  // 韻
  const 韻基元音 =
    主 === 'e' && 三等介音
      ? 'ie'
      : 主 === 'o' && ['y', 'u'].includes(介)
      ? 介 + 主
      : 主;
  let 韻 = 韻基到韻[尾].replace(/ /g, '')[韻基元音表.indexOf(韻基元音)];
  if (!韻 || 韻 === '　') {
    throw new Error(`無法識別韻基 (${音節})`);
  }
  if (韻 === '唐' && ['y', 'u'].includes(介)) {
    韻 = '陽';
  }

  // 等
  let 等;
  if (['i', 'y', 'u'].includes(主)) {
    if (三等介音 && !(主 === 'i' && ['y', 'u', 'w'].includes(介))) {
      throw介音搭配();
    }
    等 = '三';
  } else if (三等介音) {
    if (['y', 'u', 'ou', 'ee', 'eo', 'oeu'].includes(主)) {
      throw介音搭配();
    }
    等 = '三';
  } else {
    if (['ee', 'oeu', 'ae'].includes(主)) {
      等 = '二';
    } else {
      等 = 主 === 'e' ? '四' : '一';
    }
  }
  if (母 === '匣' && 等 === '三') {
    母 = '云';
  }

  // 呼
  let 呼 = null;
  if ([...'東冬江模尤幽'].includes(韻)) {
    !介 || (韻 === '幽' && 介 === 'y') || throw介音搭配();
  } else if (['鍾', '虞'].includes(韻)) {
    介 === 'u' || throw介音搭配();
  } else {
    if (['o', 'u', 'y'].includes(主) && 介 === 'w') {
      throw介音搭配();
    }
    const 拼寫呼 =
      合介音 || (['o', 'u'].includes(主) && !介 && 韻 !== '覃') ? '合' : '開';
    if (['幫', '滂', '並', '明'].includes(母)) {
      if (
        ['欣', '痕', '嚴'].includes(韻) ||
        ([...'微廢灰文元魂陽凡'].includes(韻) ||
          (韻 === '歌' && 等 === '三')) !==
          (拼寫呼 === '合')
      ) {
        throw new Error(`不合法脣音字拼寫 (${音節})`);
      }
    } else {
      呼 = 拼寫呼;
    }
  }

  // 重紐
  let 重 = null;
  if (三等介音 || 主 === 'i') {
    const 鈍介音 = ['y', 'u'].includes(介) ? 介 : null;

    if (韻 === '庚' && !鈍介音) {
      韻 = '清';
    }

    // 主元音搭配
    if (['o', 'a'].includes(主) && !鈍介音) {
      throw介音搭配();
    }
    if (韻 === '麻' && 鈍介音) {
      throw介音搭配();
    }

    // 銳聲母搭配
    if ([...'莊初崇生俟'].includes(母)) {
      if (!鈍介音) {
        throw new Error(`莊組不可配銳三等介音 (${音節})`);
      }
    } else if ([...'端透定泥來知徹澄孃精清從心邪章昌常書船日以'].includes(母)) {
      if (['i', 'e', 'ae'].includes(主) && 鈍介音) {
        throw new Error(`莊組以外銳音聲母不可配B類 (${音節})`);
      }
    }

    if (
      [...'支脂祭眞仙宵清侵鹽'].includes(韻) &&
      [...'幫滂並明見溪羣疑影曉'].includes(母)
    ) {
      重 = ['y', 'u'].includes(介) ? 'B' : 'A';
    }
  }
  // 個別韻介音搭配檢查
  if (韻 === '蒸') {
    if (主 == 'i' && ['', 'w'].includes(介)) {
      throw new Error(`蒸韻不可用A類 (${音節})`);
    }
    if (呼 === '合' || ['幫', '滂', '並', '明'].includes(母)) {
      if (!(主 == 'i' && ['y', 'u'].includes(介))) {
        throw new Error(`蒸韻脣音或合口當用B類 (${音節})`);
      }
    } else if (![...'見溪群疑云影曉匣'].includes(母)) {
      if (!(主 === 'y' && !介)) {
        throw new Error(`蒸韻銳聲母當用C類 (${音節})`);
      }
    }
  } else if (韻 === '幽') {
    // TODO 幽：幫組為B類，銳聲母為A類（上面已判定過），見影組AB兩可
  }

  // 調整
  if (韻 === '眞' && 呼 === '開' && [...'莊初崇生俟'].includes(母)) {
    // 此為總體調整，後面另有個別調整
    if (['平', '入'].includes(聲)) {
      韻 = '臻';
    }
  }

  // 個別調整
  // 由於一些不規則音韻地位在拼音中會正則化
  // 此為還原原數據表中的音韻地位
  // 由於拼音不含不規則信息，需憑具體聲韻判斷
  if (反推不規則地位) {
    // 「爹」「打」等資料中為知組（僅「地」除外）
    if (['端', '透', '定', '泥'].includes(母) && ['二', '三'].includes(等)) {
      if ([母, 呼, 韻, 聲].toString() !== '定,開,脂,去') {
        母 = { 端: '知', 透: '徹', 定: '澄', 泥: '孃' }[母];
      }
    }

    // 「碧」小韻在清韻
    if ([母, 等, 韻, 聲].toString() === '幫,三,庚,入') {
      韻 = '清';
      重 = 'B';
    }

    // 蟹攝章組一四等
    if (
      ['祭', '廢'].includes(韻) &&
      呼 === '開' &&
      [...'章昌常書船日以'].includes(母)
    ) {
      for (const [母條件, 韻條件, 聲條件] of [
        ['日', '祭', '平'],
        ['常', '祭', '平'],
        ['昌', '廢', '平'],
        ['昌', '廢', '上'],
        ['以', '廢', '上'],
        ['日', '廢', '上'],
      ]) {
        if (母條件 === 母 && 韻條件 === 韻 && 聲條件 === 聲) {
          等 = 韻 === '祭' ? '四' : '一';
          韻 = 韻 === '祭' ? '齊' : '咍';
        }
      }
    }

    // 莊組入聲臻攝
    if (['莊', '初', '崇'].includes(母) && ['眞', '臻'].includes(韻)) {
      for (const [母條件, 聲條件, 調整韻] of [
        ['莊', '上', '欣'],
        ['初', '上', '欣'],
        ['初', '入', '眞'],
        //['崇', '入', '眞'],  // 「𪗨」於兩韻重出，實際地位全同，只推為臻韻
      ]) {
        if (母條件 == 母 && 聲條件 == 聲) {
          韻 = 調整韻;
          break;
        }
      }
    }

    // 「匣合一灰上」中「倄」等字為「云合三廢上」
    if ([母, 呼, 韻, 聲].toString() === '云,合,廢,上') {
      母 = '匣';
      等 = '一';
      韻 = '灰';
    }
  }

  return new Qieyun.音韻地位(母, 呼, 等, 重, 韻, 聲);
}

export default 拼音反推;

/**
 * @param {string} 音節
 * @returns {[string, string, string]}
 */
function split音節(音節) {
  let stripped = 音節;
  let 聲;
  if (/[qh]$/.test(音節)) {
    聲 = { q: '上', h: '去' }[音節.slice(-1)];
    stripped = stripped.slice(0, -1);
  } else if (/[ktp]$/.test(音節)) {
    聲 = '入';
    stripped =
      stripped.slice(0, -1) + { k: 'ng', t: 'n', p: 'm' }[stripped.slice(-1)];
  } else {
    聲 = '平';
  }
  let 母;
  if (/^[yu]/.test(stripped)) {
    母 = '云';
  } else {
    const 聲母項 = 聲母表.reduce((cur, 聲母項) => {
      const [name, spelling] = 聲母項;
      if (stripped.startsWith(spelling)) {
        if (cur === null || spelling.length > cur[1].length) {
          return 聲母項;
        }
      }
      return cur;
    }, null);
    if (!聲母項) {
      throw new Error(`無法識別聲母 (${音節})`);
    }
    母 = 聲母項[0];
    stripped = stripped.slice(聲母項[1].length);
  }
  return [母, 聲, stripped];
}

/**
 * @param {string} 韻母
 * @returns {[string, string, string]}
 */
function split韻母(韻母, 音節 = '?') {
  let 元音 = 韻母;
  let 尾;

  const 尾Pos = 韻母.search(/(?:ng|[jnwm])$/);
  if (尾Pos === -1) {
    尾 = '';
  } else {
    尾 = 韻母.slice(尾Pos);
    元音 = 韻母.slice(0, 尾Pos);
  }

  const 主 = 主元音表.reduce((cur, v) => {
    if (元音.endsWith(v)) {
      if (cur === null || v.length > cur.length) {
        return v;
      }
    }
    return cur;
  }, null);
  if (!主) {
    throw new Error(`無法識別韻母 ${韻母} (${音節})`);
  }
  return [元音.slice(0, -主.length), 主, 尾];
}

const 聲母表 = `
  幫 p   滂 ph   並 b   明 m
  端 t   透 th   定 d   泥 n  來 l
  知 tr  徹 trh  澄 dr  孃 nr
  見 k   溪 kh   羣 g   疑 ng
  影 q   曉 h    匣 gh
  精 ts  清 tsh  從 dz  心 s  邪 z
  莊 tsr 初 tsrh 崇 dzr 生 sr 俟 zr
  章 tj  昌 tjh  常 dj  書 sj 船 zj 日 nj 以 j
`
  .trim()
  .split(/\s+/)
  .reduce((arr, s, i) => {
    if (i % 2 === 0) {
      arr.push([]);
    }
    arr[arr.length - 1].push(s);
    return arr;
  }, []);

const 韻基元音表 = `
  i     y  u  ou
  e  ee eo o  oeu
  ie    yo uo
     ae a
`
  .trim()
  .split(/\s+/);
const 主元音表 = 韻基元音表.filter((x) => !/^[iyu]./.test(x));

// prettier-ignore
const 韻基到韻 = {
  '': '脂之尤侯 　佳　模　 支魚虞 麻歌',
  ng: '蒸蒸東東 青耕登冬江 　　鍾 庚唐',
  j:  '　微微　 齊皆咍灰　 祭廢廢 夬泰',
  n:  '眞欣文　 先山痕魂　 仙元元 刪寒',
  w:  '幽　　　 蕭　　　　 宵　　 肴豪',
  m:  '侵　　　 添咸　覃　 鹽嚴凡 銜談',
};
