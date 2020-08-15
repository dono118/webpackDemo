// 引入样式文件
import '../css/index.css';

const add = (x, y) => {
  return x + y;
};

console.log(add(1, 2));

const promise = new Promise(() => {
  setTimeout(() => {
    console.log('定时器执行完毕...');
  }, 1000);
});

console.log(promise);
