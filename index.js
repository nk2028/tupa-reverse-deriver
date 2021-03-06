// @ts-check

const Qieyun = require('qieyun');

module.exports = 拼音反推;

/**
 * @param {string} 音節
 * @returns {Qieyun.音韻地位}
 */
function 拼音反推(音節) {
  音節 = 音節.toLowerCase();

  // 分解音節
  let [母, 聲, 韻母] = split音節(音節);
  const [介, 主, 尾] = split韻母(韻母, 音節);

  // 分析介音
  const 合介音 = /^[wu]/.test(介) ? 介.slice(0, 1) : null;
  const 三等介音 = /[iyu]$/.test(介) ? 介.slice(-1) : null;

  function throw介音搭配(提示) {
    const hint = 提示 ? ` 【提示：${提示}】` : '';
    throw new Error(`不合法介音搭配 ${介}-${主}${尾} (${音節})${hint}`);
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
    const 韻基 = 韻基元音 + 尾;
    let 提示 = '';
    if (/e?ow/.test(韻基)) {
      提示 = '侯韻為 ou';
    } else if (韻基 === 'yw') {
      提示 = '幽韻為 (y)iw';
    }
    if (提示) {
      提示 = ` 【提示：${提示}】`;
    }
    throw new Error(`無法識別韻基 ${韻基元音}${尾} (${音節})${提示}`);
  }
  if (韻 === '唐' && ['i', 'y', 'u'].includes(介)) {
    韻 = '陽';
  }

  // 等
  let 等;
  if (['i', 'y', 'u'].includes(主)) {
    if (三等介音 && !(主 === 'i' && ['y', 'u', 'w'].includes(介))) {
      throw介音搭配(主 === 'u' ? '三等 u 不需介音' : null);
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

  // 呼
  let 呼 = null;
  if ([...'東冬江模尤'].includes(韻)) {
    !介 ||
      throw介音搭配(主 === 'o' && 介.endsWith('i') ? '用鈍介音 y/u' : null);
  } else if (['鍾', '虞'].includes(韻)) {
    介 === 'u' || throw介音搭配();
  } else if (韻 === '幽') {
    !介 || 介 === 'y' || throw介音搭配();
  } else {
    if (['o', 'u', 'y'].includes(主) && 介 === 'w') {
      throw介音搭配(
        主 === 'o'
          ? '合口 o 不需 w 介音'
          : 主 === 'y'
          ? 'y 所對應合口為 u'
          : null,
      );
    }
    const 拼寫呼 =
      合介音 || (['o', 'u'].includes(主) && !介 && 韻 !== '覃') ? '合' : '開';
    if (['幫', '滂', '並', '明'].includes(母)) {
      if (
        ['欣', '痕', '嚴'].includes(韻) ||
        ([...'微廢灰文元魂凡'].includes(韻) ||
          (韻 === '歌' && 等 === '三') ||
          (韻 === '陽' && 介 !== 'i')) !==
          (拼寫呼 === '合')
      ) {
        throw new Error(`不合法脣音拼寫開合 (${音節})`);
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
    if (韻 === '陽' && 介 === 'i' && [...'幫滂並明'].includes(母)) {
      // 陽韻特殊重紐（如「𩦠」小韻）
      重 = 'A';
    } else if (['o', 'a'].includes(主) && !鈍介音) {
      throw介音搭配('用鈍介音 y/u');
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
      [...'支脂祭眞仙宵侵鹽'].includes(韻) &&
      [...'幫滂並明見溪羣疑影曉匣'].includes(母)
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
    } else if ([...'見溪群疑影曉匣云'].includes(母)) {
      // 蒸韻實無云母開口，此處僅為使 if 分支覆蓋萬一的情形而已
      主 === 'i' && 介 === 'y' && 母 !== '云' && (重 = 'B');
    } else if (!(主 === 'y' && !介)) {
      throw new Error(`蒸韻銳聲母當用C類 (${音節})`);
    }
  } else if (韻 === '幽') {
    if (['幫', '滂', '並', '明'].includes(母) && 介 !== 'y') {
      throw new Error(`幽韻脣音當用B類 (${音節})`);
    } else if ([...'見溪群疑影曉匣'].includes(母) && 介 === 'y') {
      重 = 'B';
    }
  }

  // 調整
  if (韻 === '眞' && 呼 === '開' && [...'莊初崇生俟'].includes(母)) {
    // 此為總體調整，後面另有個別調整
    韻 = '臻';
  }

  try {
    return new Qieyun.音韻地位(母, 呼, 等, 重, 韻, 聲);
  } catch (e) {
    const 描述 = `${母}${呼 || ''}${等}${重 || ''}${韻}${聲}`;
    let 提示 = '';
    if (等 === '三' && ['寒', '談'].includes(韻)) {
      提示 = `${韻 === '寒' ? '元' : '嚴凡'}韻為 y/uo${
        韻 === '寒' ? 'n' : 'm'
      }`;
    }
    if (提示) {
      提示 = ` 【提示：${提示}】`;
    }
    throw new Error(`音韻地位「${描述}」不合法 (${音節}): ${e.message}${提示}`);
  }
}

/**
 * @param {string} 音節
 * @returns {[string, string, string]}
 */
function split音節(音節) {
  let rest = 音節;

  let 母;
  if (/^[yu]/.test(rest)) {
    母 = '云';
  } else {
    const match = /^[^aeiouwy]+/.exec(rest);
    const 母拼寫 = match ? match[0] : '';
    母 = 聲母表[母拼寫];
    if (!母) {
      let 提示 = '';
      let 糾正 = 聲母糾正表[母拼寫];
      if (糾正) {
        if (!(糾正 instanceof Array)) {
          糾正 = [糾正];
        }
        提示 = 糾正
          .map((/** @type {string} */ x) => `${聲母表[x]}母為 ${x}`)
          .join('、');
      } else if (/^w[yu]/.test(rest)) {
        提示 = '云母不寫';
      }
      if (提示) {
        提示 = ` 【提示：${提示}】`;
      }
      throw new Error(`無法識別聲母 ${母拼寫} (${音節})${提示}`);
    }
    rest = rest.slice(母拼寫.length);
  }

  let 聲;
  if (/[qh]$/.test(rest)) {
    聲 = { q: '上', h: '去' }[rest.slice(-1)];
    rest = rest.slice(0, -1);
  } else if (/[ktp]$/.test(rest)) {
    聲 = '入';
    rest = rest.slice(0, -1) + { k: 'ng', t: 'n', p: 'm' }[rest.slice(-1)];
  } else if (/x$/.exec(rest)) {
    throw new Error(
      `無法識別聲調 ${rest.slice(-1)} (${音節})` + `【提示：上聲用 -q】`,
    );
  } else {
    聲 = '平';
  }

  return [母, 聲, rest];
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
  const 介 = 元音.slice(0, -主.length);
  if (!['', 'y', 'u', 'i', 'wi', 'w'].includes(介)) {
    let 提示 = '';
    if (/[iu]$/.test(主) && /[aeiouy]$/.test(介)) {
      提示 = ' 【提示：切韻拼音用 -j -w 尾】';
    }
    throw new Error(`無法識別韻母 ${韻母}  (${音節})${提示}`);
  }
  return [介, 主, 尾];
}

const 聲母表 = Object.fromEntries(
  `
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
      arr[arr.length - 1].unshift(s);
      return arr;
    }, []),
);

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

const 聲母糾正表 = {
  // h 應置後
  thr: 'trh',
  tshr: 'tsrh',
  thj: 'tjh',
  // 章組
  tsj: 'tj',
  tsjh: 'tjh',
  tshj: 'tjh',
  dzj: 'dj',
  // 其他
  x: ['h', 'gh'],
  c: ['ts', 'tj'],
  ch: ['tsh', 'tjh'],
  sh: 'sj',
  zh: 'zj',
};
