ifProd = () => process.env.NODE_ENV === 'production'

module.exports = {
  lintOnSave: false,
  productionSourceMap: ifProd(),
  publicPath: ifProd() ? '/acloud/dist/' : '/',
}
