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

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'login', 'close'])

const handleLogin = async () => {
  try {
    const loginRes = await Taro.login()
    if (loginRes.code) {
      console.log('登录成功，code:', loginRes.code)
      // 这里应该调用后端接口获取token和isAuth
      // 模拟后端返回数据
      const mockResponse = {
        token: 'mock_token',
        isAuth: false
      }
      // 存储token
      Taro.setStorageSync('token', mockResponse.token)
      // 通知父组件登录成功，并传递是否已授权的状态
      emit('login', mockResponse.isAuth)
    }
  } catch (err) {
    console.error('登录失败', err)
    Taro.showToast({
      title: '登录失败',
      icon: 'error'
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