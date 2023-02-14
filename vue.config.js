const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
  filenameHashing: false,
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.ts',
      title: 'Popup',
    },
    contentPopup: {
      template: 'public/browser-extension.html',
      entry: './src/contentPopup/main.ts',
      title: 'Popup',
    },
    faq: {
      template: 'public/browser-extension.html',
      entry: './src/views/faq/main.ts',
      title: 'FAQ',
    },
    accountProtection: {
      template: 'public/browser-extension.html',
      entry: './src/views/accountProtection/main.ts',
      title: 'CS.Money Antiscam',
    },
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.ts',
        },
        contentScripts: {
          entries: {
            antiscamContentPopupHandler: [
              'src/contentPopup/contentPopup.ts',
            ],
            insertAntiscamContentPopup: [
              'src/contentPopup/insertPopup.ts',
            ],
            liveAnalysis: [
              'src/analysis/liveAnalysis.ts',
            ],
            fakeLogin: [
              'src/analysis/fakeLogin.ts',
            ],
            tradeOfferAnalysis: [
              'src/analysis/tradeOfferAnalysis.ts',
            ],
            detect: [
              'src/analysis/detect.ts',
            ],
            steamrepAnalysis: [
              'src/analysis/steamrepAnalysis.ts',
            ],
            p2pAnalysis: [
              'src/analysis/p2pAnalysis.ts',
            ],
            inventory: [
              'src/inventory/main.ts',
            ],
            tradeInventories: [
              'src/inventory/tradeInventories.ts',
            ],
          },
        },
      },
    },
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/assets/scss/index.scss";
        `
      }
    }
  },
  configureWebpack: {
    plugins: [
      new CopyPlugin(
        [
          {
            from: path.resolve(__dirname, `./src/assets/images/`),
            to: path.resolve(__dirname, './dist/img/')
          },
          {
            from: path.resolve(__dirname, `./src/inventory/itemHolder/inventoryItemHolder.html`),
            to: path.resolve(__dirname, './dist/inventory/')
          },
          {
            from: path.resolve(__dirname, `./src/inventory/itemInfo/inventoryItemInfo.html`),
            to: path.resolve(__dirname, './dist/inventory/')
          },
          {
            from: path.resolve(__dirname, `./src/inventory/itemOverstock/inventoryItemOverstock.html`),
            to: path.resolve(__dirname, './dist/inventory/')
          },
          {
            from: path.resolve(__dirname, `./src/inventory/loader/inventoryLoader.html`),
            to: path.resolve(__dirname, './dist/inventory/')
          },
          {
            from: path.resolve(__dirname, `./src/inventory/itemIsPopular/inventoryItemIsPopular.html`),
            to: path.resolve(__dirname, './dist/inventory/')
          },
          {
            from: path.resolve(__dirname, `./src/inventory/totalPrices/inventoryTotalPrices.html`),
            to: path.resolve(__dirname, './dist/inventory/')
          },
          {
            from: path.resolve(__dirname, `./src/analysis/p2pAnalysis/tradeOfferCardWarning/tradeOfferCardWarning.html`),
            to: path.resolve(__dirname, './dist/p2pAnalysis/')
          },
          {
            from: path.resolve(__dirname, `./src/analysis/notify/notify.html`),
            to: path.resolve(__dirname, './dist/notify/')
          },
          {
            from: path.resolve(__dirname, `./src/assets/css/`),
            to: path.resolve(__dirname, './dist/css/')
          },
          {
            from: path.resolve(__dirname, `./src/assets/fonts/`),
            to: path.resolve(__dirname, './dist/fonts/')
          },
          {
            from: path.resolve(__dirname, `./src/assets/fonts/`),
            to: path.resolve(__dirname, './dist/p2pAnalysis/fonts/')
          },
          {
            from: path.resolve(__dirname, `./src/assets/fonts/`),
            to: path.resolve(__dirname, './dist/notify/fonts/')
          },
          {
            from: path.resolve(__dirname, `./src/assets/fonts/`),
            to: path.resolve(__dirname, './dist/inventory/fonts/')
          },
        ]
      ),
    ]
  }
}
