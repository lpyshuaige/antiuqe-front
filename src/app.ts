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
  FormItem
} from '@nutui/nutui-taro'

const App = createApp({
  onShow (options) {},
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

export default App
