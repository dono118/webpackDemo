// 引入样式文件
import '../css/index.css';

import { subtract } from './test';

function sum(...args) {
  return args.reduce((p, c) => p + c, 0);
}

// eslint-disable-next-line
console.log(sum(1, 2, 3, 4));

// eslint-disable-next-line
console.log(subtract(6, 1));