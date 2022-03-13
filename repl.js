// 啟動 REPL 並自動 import

import 拼音反推 from './index.js';
import Qieyun from 'qieyun';

import { start as startRepl } from 'repl';

const repl = startRepl();
repl.context.拼音反推 = 拼音反推;
repl.context.rev = 拼音反推;
repl.context.Qieyun = Qieyun;
