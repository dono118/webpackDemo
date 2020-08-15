// 引入样式文件
import '../css/index.css';

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
