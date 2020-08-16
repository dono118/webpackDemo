// 引入样式文件
import '../css/index.css';
// 引入js文件
import print from './print';

const add = (x, y) => x + y;

// 下一行不进行eslint检查
// eslint-disable-next-line
console.log(add(1, 2));

const promise = new Promise(() => {
  setTimeout(() => {
    // eslint-disable-next-line
    console.log('定时任务完毕...');
  }, 1000);
});

// eslint-disable-next-line
console.log(promise);

// 如果module.hot为true, 说明开启了HMR功能
if (module.hot) {
  // 监听print.js, 一旦发生变化, 就会执行回调函数print()
  // 而其他模块不会重新打包构建
  module.hot.accept('./print.js', () => {
    print();
  });
}
