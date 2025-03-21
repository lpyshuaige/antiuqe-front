import { createApp } from 'vue'
import '@nutui/nutui-taro/dist/style.css'
import '@nutui/icons-vue/dist/style_iconfont.css'
import './app.css'

// 导入需要使用的组件
import {
  Button,
  Avatar,
  Cell,
  CellGroup,
  Uploader,
  Steps,
  Step,
  Popup,
  Checkbox,
  Form,
  FormItem,
  Empty,
  Pagination
} from '@nutui/nutui-taro'
import Taro from "@tarojs/taro";
import BASE_URL from "./utils/request";


const App = createApp({
  onLaunch (options) {
    const userInfo = Taro.getStorageSync('userInfo')
    if (userInfo && userInfo.isMember) {
      console.log('用户目前是会员，检查会员状态');
      try {
        Taro.request({
          url: `${BASE_URL}/user/checkMember`,
          method: 'GET',
          header: {
            'sessionId': Taro.getStorageSync('token')
          },
          success: (res) => {
            if (res.statusCode === 200 && res.data.code === 200){
              if (res.data.data !== userInfo.isMember){
                console.log('会员状态发生变化，更新本地缓存')
                userInfo.isMember = res.data.data
              }
              Taro.setStorageSync('userInfo', userInfo)
            }
          },
        })
      }catch (err){
        console.log('获取会员状态失败',err)
      }
    }
  },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

// 注册组件
App.use(Button)
   .use(Avatar)
   .use(Cell)
   .use(CellGroup)
   .use(Uploader)
   .use(Steps)
   .use(Step)
   .use(Popup)
   .use(Checkbox)
   .use(Form)
   .use(FormItem)
   .use(Empty)
   .use(Pagination)

export default App
