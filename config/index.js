import { defineConfig } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
const path = require('path')
const webpack = require('webpack')

const config = {
  projectName: 'appthen-taro',
  date: '2022-11-3',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  defineConstants: {},
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
    ...(process.env.TARO_ENV === 'rn'
      ? {
          'cross-ui': path.resolve(__dirname, '..', 'node_modules/cross-ui/rn')
        }
      : {})
  },
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: 'webpack5',
  cache: {
    enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  plugins: [['@tarojs/plugin-html', {
    pxtransformBlackList: [/adm-/, /demo-/, /^body/]
  }]],
  sass: {
    resource:
      process.env.TARO_ENV === 'rn'
        ? ['node_modules/cross-ui/rn/style/index.scss']
        : []
  },
  mini: {
    miniCssExtractPluginOption: {
      ignoreOrder: true
    },
    compile: {
      include: [modulePath => modulePath.indexOf('cross-ui') >= 0]
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 20480 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)

      // Taro 3.1 & 3.2
      chain.resolve.plugin('MultiPlatformPlugin').tap(args => {
        return [
          ...args,
          {
            include: ['cross-ui']
          }
        ]
      })

      // Taro 3.3+
      chain.resolve.plugin('MultiPlatformPlugin').tap(args => {
        args[2]['include'] = ['cross-ui']
        return args
      })

      chain.merge({
        resolve: {
          fallback: {
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify')
          }
        }
      })
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    compile: {
      include: [modulePath => modulePath.indexOf('cross-ui') >= 0]
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          maxRootSize: 20
        }
      },
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      // Taro 3.1 & 3.2
      chain.resolve.plugin('MultiPlatformPlugin').tap(args => {
        return [
          ...args,
          {
            include: ['cross-ui']
          }
        ]
      })

      // Taro 3.3+
      chain.resolve.plugin('MultiPlatformPlugin').tap(args => {
        args[2]['include'] = ['cross-ui']
        return args
      })

      chain.merge({
        resolve: {
          fallback: {
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify')
          }
        }
      })
    }
  },
  rn: {
    resolve: {
      include: ['cross-ui']
    },
    enableSvgTransform: true,
    output: {
      iosSourceMapUrl: '', // sourcemap 文件url
      iosSourcemapOutput: '../../mengti/taro-native-shell-0.69.0/ios/main.map', // sourcemap 文件输出路径
      iosSourcemapSourcesRoot: '', // 将 sourcemap 资源路径转为相对路径时的根目录
      androidSourceMapUrl: '',
      androidSourcemapOutput:
        '../../mengti/taro-native-shell-0.69.0/android/app/src/main/assets/index.android.map',
      androidSourcemapSourcesRoot: '',
      ios: '../../mengti/taro-native-shell-0.69.0/ios/main.jsbundle',
      iosAssetsDest: '../../mengti/taro-native-shell-0.69.0/ios',
      android:
        '../../mengti/taro-native-shell-0.69.0/android/app/src/main/assets/index.android.bundle',
      androidAssetsDest:
        '../../mengti/taro-native-shell-0.69.0/android/app/src/main/res'
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
