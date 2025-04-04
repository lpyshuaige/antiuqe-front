<template>
  <nut-popup 
    v-model:visible="isVisible"
    position="bottom" 
    :style="{ borderRadius: '12px 12px 0 0' }"
    :overlay-style="{ background: 'rgba(0, 0, 0, 0.7)' }"
    :close-on-click-overlay="true"
    @click-overlay="() => emit('close')"
  >
    <view class="auth-popup">
      <view class="popup-content">
        <view class="popup-header">
          <view class="close-icon" @click="handleClose">
            <IconFont name="close" size="20"></IconFont>
          </view>
        </view>
        <view class="title">获取您的头像、昵称</view>
        <view class="subtitle">仅作个人资料展示</view>
        
        <view class="avatar-section">
          <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar"  >
            <nut-avatar 
              class="avatar" 
              size="large"
            >
              <img v-if="avatarUrl" :src="avatarUrl" class="avatar-img" />
              <IconFont v-else name="my" size="40" />
            </nut-avatar>
          </button>
        </view>

        <view class="nickname-section">
          <input 
            type="nickname" 
            class="nickname-input" 
            :value="nickname" 
            @change="onNickNameChange"
            placeholder="请输入昵称,不要带入表情"
          />
        </view>
        
        <!-- 隐私协议勾选区域 -->
        <view class="agreement-section">
          <view class="agreement-container">
            <nut-checkbox v-model="agreedToTerms" icon-size="14" class="checkbox" />
            <view class="agreement-text-container">
              <text class="agreement-text">我已阅读并同意</text>
              <text class="agreement-link" @tap.stop="openPrivacyContract">《隐私协议》</text>
              <text class="agreement-text">和</text>
              <text class="agreement-link" @tap.stop="openUserAgreement">《用户注册与服务协议》</text>
            </view>
          </view>
        </view>

        <view class="button-group">
          <nut-button 
            class="btn-cancel" 
            plain
            block
            color="#07c160"
            @click="handleClose"
          >
            拒绝
          </nut-button>
          <nut-button 
            class="btn-confirm" 
            block
            color="#07c160"
            :disabled="isLoading"
            :loading="isLoading"
            @click="handleConfirm"
          >
            允许
          </nut-button>
        </view>
      </view>
    </view>
  </nut-popup>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import Taro from '@tarojs/taro'
import { IconFont } from "@nutui/icons-vue-taro"
import BASE_URL from "../utils/request";
import log from "../utils/log";


const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})
const isVisible = ref(false)
watch(() => props.show, (newValue) => {
  isVisible.value = newValue
})

const emit = defineEmits(['update:show', 'confirm', 'close'])

const avatarUrl = ref('')
const nickname = ref('')
const agreedToTerms = ref(false)
const isLoading = ref(false)


const onChooseAvatar = (e) => {
  const { avatarUrl: newAvatarUrl } = e.detail
  console.log('用户选择头像：', newAvatarUrl)
  avatarUrl.value = newAvatarUrl
}

const onNickNameChange = (e) => {
  const { value: newNickName } = e.detail
  nickname.value = newNickName
}

// 打开隐私协议
const openPrivacyContract = () => {
  try {
    console.log('打开隐私协议')
    Taro.openPrivacyContract({
      success: () => {
        console.log('打开隐私协议成功')
      },
      fail: (err) => {
        console.error('打开隐私协议失败', err)
        // 如果微信API调用失败，尝试跳转到自定义页面
        Taro.navigateTo({
          url: '/pages/privacy/index'
        }).catch(e => {
          console.error('跳转隐私协议页面失败', e)
          Taro.showToast({
            title: '打开隐私协议失败',
            icon: 'none'
          })
        })
      }
    })
  } catch (error) {
    console.error('调用隐私协议API失败', error)
    // 降级处理：尝试跳转到自定义页面
    Taro.navigateTo({
      url: '/pages/privacy/index'
    }).catch(e => {
      console.error('跳转隐私协议页面失败', e)
      Taro.showToast({
        title: '打开隐私协议失败',
        icon: 'none'
      })
    })
  }
}

// 打开用户协议
const openUserAgreement = () => {
  console.log('打开用户协议')
  Taro.navigateTo({
    url: '/pages/agreement/index'
  }).catch(err => {
    console.error('打开用户协议失败', err)
    Taro.showToast({
      title: '打开用户协议失败',
      icon: 'none'
    })
  })
}

const handleConfirm = async () => {
  isLoading.value = true
  if (!agreedToTerms.value) {
    Taro.showToast({
      title: '请先阅读并同意协议',
      icon: 'none'
    })
    isLoading.value = false
    return
  }
  
  if (!avatarUrl.value || !nickname.value) {
    Taro.showToast({
      title: '请完善头像和昵称',
      icon: 'none'
    })
    isLoading.value = false
    return
  }

  try {
    console.log('开始上传文件，参数：', {
      avatarUrl: avatarUrl.value,
      nickname: nickname.value,
      token: Taro.getStorageSync('token')
    })

    // 直接调用上传接口
    const res = await Taro.uploadFile({
      url: `${BASE_URL}/user/userAuth`,
      filePath: avatarUrl.value,
      name: 'avatar',
      formData: {
        'nickname': nickname.value
      },
      header: {
        'sessionId': Taro.getStorageSync('token')
      }
    })

    console.log('上传响应：', res)

    if (res.statusCode === 200) {
      const responseData = JSON.parse(res.data)
      console.log('授权成功：', responseData)

      if (responseData.code !== 200) {
        throw new Error(responseData.msg || '服务器返回错误')
      }

      // 获取原有的用户信息
      const existingUserInfo = Taro.getStorageSync('userInfo') || {}
      
      // 更新本地存储的用户信息，保留原有字段
      const userInfo = {
        ...existingUserInfo,
        avatarUrl: responseData.data.avatarUrl,
        nickname: responseData.data.nickname
      }
      
      Taro.setStorageSync('userInfo', userInfo)
      console.log('更新用户信息成功：', userInfo)
      
      // 通知父组件授权成功
      emit('confirm', userInfo)
    } else {
      log.error('上传失败：', res)
      throw new Error(`请求失败，状态码：${res.statusCode}`)
    }
    isLoading.value = false
  } catch (error) {
    console.error('授权详细错误：', error)
    log.error('授权失败',error)
    Taro.showToast({
      title: '授权失败，请重试',
      icon: 'error'
    })
    isLoading.value = false
  }
}

const handleClose = () => {
  Taro.showModal({
    title: '提示',
    content: '授权后享受完整服务，是否放弃授权？',
    success: (res) => {
      if (res.confirm) {
        emit('close')
      }
    }
  })
}
</script>

<style lang="scss">
.auth-popup {
  background: #f8f8f8;
  border-radius: 12px 12px 0 0;
  overflow: hidden;

  .popup-content {
    padding: 24px;

    .popup-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;

      .close-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
    }

    .title {
      font-size: 17px;
      font-weight: 500;
      color: #333;
      text-align: center;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 14px;
      color: #888;
      text-align: center;
      margin-bottom: 24px;
    }

    .avatar-section {
      padding: 24px 16px;
      display: flex;
      justify-content: center;
      border-bottom: 1px solid #eee;

      .avatar-wrapper {
        background: none;
        padding: 0;
        width: 80px;
        height: 80px;

        &::after {
          border: none;
        }

        .avatar {
          width: 100%;
          height: 100%;
          background-color: #f8f8f8;
          border-radius: 6px;
          overflow: hidden;

          .avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .nutui-iconfont {
            color: #999;
            line-height: 80px;
            font-size: 40px;
          }
        }
      }
    }

    .nickname-section {
      position: relative;
      padding: 0 16px;

      &::before,
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: #eee;
      }

      &::before {
        top: 0;
      }

      &::after {
        bottom: 0;
      }

      .nickname-input {
        width: 100%;
        height: 48px;
        border: none;
        font-size: 16px;
        background: transparent;
        text-align: center;

        &::placeholder {
          color: #999;
        }
      }
    }

    /* 协议勾选样式 */
    .agreement-section {
      margin-top: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      color: #666;
      line-height: 20px;
      
      .agreement-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .checkbox {
        margin-right: 5px;
      }
      
      .agreement-text-container {
        display: flex;
        align-items: center;
      }
      
      .agreement-text {
        color: #666;
      }
      
      .agreement-link {
        color: #07c160;
      }
    }

    .button-group {
      display: flex;
      gap: 12px;
      padding: 0 40px;
      margin-top: 24px;

      .nut-button {
        flex: 1;
        border-radius: 4px;
        height: 40px;
        font-size: 16px;

        &.btn-cancel {
          &:active {
            opacity: 0.8;
          }
        }

        &.btn-confirm {
          &:active {
            opacity: 0.8;
          }

          &[disabled] {
            opacity: 0.5;
          }
        }
      }
    }
  }
}
</style> 