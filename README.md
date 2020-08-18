# webpack demo
node.js 版本: v12.18.3

cd 到新建的空目录 webpackDemo 下, 依次执行如下命令:
```
> nmp init
> npm i webpack webpack-cli -g
> npm i webpack webpack-cli -D
```

```
开发环境:
   运行项目指令:
     webpack 会将打包结果输出到目标路径
     npx webpack-dev-server 只会在内存中打包编译, 没有输出
 ```

# webpack 性能优化

## 开发环境性能优化
* 优化打包构建速度
  * HMR(Hot Module Replacement, 模块热替换)
* 优化代码调试
  * source-map

## 生产环境性能优化
* 优化打包构建速度
  * oneOf
  * babel 缓存
  * 多进程打包
  * externals
  * dll
* 优化代码运行的性能
  * 缓存(hash-chunkhash-contenthash)
  * tree shaking
  * code split
  * 懒加载/预加载
  * PWA(Progressive web apps, 渐进式 Web 应用)
  