<template>
  <nut-popup v-model:visible="isVisible" @update:visible="onVisibleChange"  position="bottom" :style="{ borderRadius: '16px 16px 0 0',display: 'block !important'}">
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
import Taro, {useDidShow} from '@tarojs/taro'
import { IconFont } from "@nutui/icons-vue-taro"
import BASE_URL from "../utils/request";
import {ref, watch} from "vue";
import log from "../utils/log";

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'login', 'close'])

const isVisible = ref(false)
watch(() => props.show, (newValue) => {
  isVisible.value = newValue
})
// 处理visible变化
const onVisibleChange = (value) => {
  isVisible.value = value
  if (!value) {
    emit('update:show', false)
    emit('close')
  }
}

// 登录请求函数
const loginRequest = async (code: string) => {
  try {
    const response = await Taro.request({
      url: `${BASE_URL}/user/login`,
      method: 'GET',
      header: {
        'code': code
      }
    })
    return response
  } catch (error) {
    log.error('登录请求失败：', error)
    throw error
  }
}

const handleLogin = async () => {
  try {
    const loginRes = await Taro.login()
    if (loginRes.code) {
      // 调用后端登录接口
      const res = await loginRequest(loginRes.code)
      
      // 存储token
      Taro.setStorageSync('token', res.data.data.sessionId)
      Taro.setStorageSync('userInfo', res.data.data)
      const userInfo = Taro.getStorageSync('userInfo')
      // 通知父组件登录成功，并传递是否已授权的状态
      emit('login',userInfo)
      isVisible.value = false
      // 关闭登录弹窗
      emit('update:show', false)
      emit('close')
    }
  } catch (err) {
    log.error('登录失败', err)
    Taro.showToast({
      title: '登录失败',
      icon: 'error',
      duration: 2000
    })
  }
}

const handleClose = () => {
  isVisible.value = false
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