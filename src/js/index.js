// 引入样式文件
import '../css/index.css';
import $ from 'jquery';

function sum(...args) {
  return args.reduce((p, c) => p + c, 0);
}

// eslint-disable-next-line
console.log(sum(1, 2, 3, 4));

$('#btn').click(() => {
  /**
   * 使用import动态导入语法引入的js文件, 会被单独打包成一个chunk
   * 使用注释的方式设置chunkName
   * 正常加载: 并行加载(同时加载多个文件)
   * 懒加载: 当文件需要时才加载
   * 预加载(prefetch): 等其他资源加载完成后, 利用空闲时间提前加载好
   */
  import(/* webpackChunkName: 'test', webpackPrefetch: true */'./test')
    .then(({ add }) => {
      // eslint-disable-next-line
      console.log(add(5, 6));
    })
    .catch(() => {
      // eslint-disable-next-line
      console.log('test.js加载失败...')
    });
});
