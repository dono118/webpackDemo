// 引入样式文件
import '../css/index.css';

function sum(...args) {
  return args.reduce((p, c) => p + c, 0);
}

// eslint-disable-next-line
console.log(sum(1, 2, 3, 4));

// 使用import动态导入语法引入的js文件, 会被单独打包成一个chunk
// 使用注释的方式设置chunkName
import(/* webpackChunkName: 'test' */'./test')
  .then(({ add }) => {
    // eslint-disable-next-line
    console.log(add(5, 6));
  })
  .catch(() => {
    // eslint-disable-next-line
    console.log('test.js加载失败...')
  });
