export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/profile/index',
    'pages/result/index',
    'pages/history/index',
    'pages/order/detail/index',
    'pages/order/list/index',
    'pages/userInfo/index',
    'pages/agreement/index',
    'pages/contact/index',
    'pages/settings/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '古玩鉴别',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#1296db',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '鉴别',
        iconPath: './assets/tabbar/home.png',
        selectedIconPath: './assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: './assets/tabbar/my.png',
        selectedIconPath: './assets/tabbar/my-active.png'
      }
    ]
  }
})
