<template>
  <nut-popup :visible="show" position="bottom" :style="{ borderRadius: '16px 16px 0 0' }">
    <view class="login-popup">
      <view class="popup-header">
        <view class="close-icon" @click="handleClose">
          <IconFont name="close" size="20"></IconFont>
        </view>
      </view>
      <view class="popup-content">
        <button class="wechat-login-btn" @tap="handleLogin">
          <IconFont name="weixin" size="20" />
          微信一键登录
        </button>
      </view>
    </view>
  </nut-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import { IconFont } from "@nutui/icons-vue-taro"
import BASE_URL from "../utils/request";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'login', 'close'])

// 登录请求函数
const loginRequest = async (code: string) => {
  try {
    console.log('发送登录请求...')
    const response = await Taro.request({
      url: `${BASE_URL}/user/login`,
      method: 'GET',
      header: {
        'code': code
      }
    })
    console.log('登录请求成功：', response)
    return response
  } catch (error) {
    console.error('登录请求失败：', error)
    throw error
  }
}

const handleLogin = async () => {
  try {
    const loginRes = await Taro.login()
    if (loginRes.code) {
      console.log('微信登录成功，code:', loginRes.code)
      
      // 调用后端登录接口
      const res = await loginRequest(loginRes.code)
      
      // 存储token
      console.log(res)
      Taro.setStorageSync('token', res.data.data.sessionId)
      Taro.setStorageSync('userInfo', res.data.data)
      // 通知父组件登录成功，并传递是否已授权的状态
      emit('login')
      
      // 关闭登录弹窗
      emit('close')
    }
  } catch (err) {
    console.error('登录失败', err)
    Taro.showToast({
      title: '登录失败',
      icon: 'error',
      duration: 2000
    })
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<style lang="scss">
.login-popup {
  padding: 24px;

  .popup-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;

    .close-icon {
      padding: 8px;
      color: #999;
    }
  }

  .popup-content {
    padding: 0 20px 40px;

    .wechat-login-btn {
      width: 100%;
      height: 44px;
      background: #07c160;
      color: #fff;
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      border: none;

      &::after {
        border: none;
      }

      .nutui-iconfont {
        margin-right: 8px;
      }
    }
  }
}
</style> 