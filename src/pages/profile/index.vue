<template>
  <view class="profile-container">
    <view class="user-info">
      <view class="avatar-section" @tap="handleLogin" v-if="!userInfo">
        <nut-avatar size="large"></nut-avatar>
        <text class="login-text">登录/注册</text>
      </view>
      
      <view class="user-detail" v-else>
        <nut-avatar size="large" class="avatar">
          <img :src="userInfo.avatarUrl" class="avatar-img" />
        </nut-avatar>
        <view class="nickname-container">
          <text class="nickname">{{ userInfo.nickname || '微信用户' }}</text>
          <!-- 会员标识 -->
          <view v-if="userInfo && userInfo.isMember" class="member-badge">会员</view>
        </view>
        <view class="arrow-icon" @tap="goToUserInfo">
          <IconFont name="right" size="16" />
        </view>
      </view>
    </view>

    <view class="menu-list">
      <nut-cell-group>
        <nut-cell title="我的订单" is-link @click="handleOrder">
          <template #icon><IconFont name="order" size="16"></IconFont></template>
        </nut-cell>
        <nut-cell title="鉴定记录" is-link @click="handleHistory">
          <template #icon><IconFont name="clock" size="16"></IconFont></template>
        </nut-cell>
        <nut-cell title="联系客服" is-link @click="handleService">
          <template #icon><IconFont name="service" size="16"></IconFont></template>
        </nut-cell>
        <nut-cell title="设置" is-link @click="handleAbout">
          <template #icon><IconFont name="setting" size="16"></IconFont></template>
        </nut-cell>
      </nut-cell-group>

      <!-- 退出登录按钮 -->
      <view v-if="userInfo" class="logout-section">
        <nut-button 
          class="logout-btn" 
          type="default"
          @click="handleLogout"
        >
          退出登录
        </nut-button>
      </view>
    </view>

    <LoginPopup 
      :show="showLoginPopup" 
      @login="handleLoginResponse" 
      @close="handleLoginClose"
    />
    <AuthPopup 
      :show="showAuthPopup" 
      @confirm="handleAuthConfirm" 
      @close="handleAuthClose"
    />
  </view>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import Taro, {useDidShow} from '@tarojs/taro'
import { IconFont } from "@nutui/icons-vue"
import LoginPopup from '../../components/LoginPopup.vue'
import AuthPopup from '../../components/AuthPopup.vue'
import BASE_URL from "../../utils/request";

const userInfo = ref(null)
const showLoginPopup = ref(false)
const showAuthPopup = ref(false)

// 处理登录点击
const handleLogin = () => {
  showLoginPopup.value = true
}

// 处理登录响应
const handleLoginResponse = (data) => {
  showLoginPopup.value = false
  // 检查授权状态
  if (!data || !data.nickname || !data.avatarUrl) {
    // 未授权，显示授权弹窗
    console.log('未授权，显示授权弹窗')
    showAuthPopup.value = true
  }else {
    console.log('已授权')
    userInfo.value = data
    Taro.showToast({
      title: '登录成功',
      icon: 'success'
    })
  }
}

// 处理登录弹窗关闭
const handleLoginClose = () => {
  showLoginPopup.value = false
}

// 处理授权确认
const handleAuthConfirm = (info) => {
  showAuthPopup.value = false
  userInfo.value = info
  Taro.showToast({
    title: '授权完成',
    icon: 'success'
  })
}

// 处理授权弹窗关闭
const handleAuthClose = () => {
  showAuthPopup.value = false
}

// 在组件挂载时检查是否有用户信息
onMounted(() => {
  console.log('检查是否有用户信息')
  try {
    const profile = Taro.getStorageSync('userInfo')
    if (profile) {
      console.log('已获取用户信息', profile)
      userInfo.value = profile
    }
  } catch (err) {
    console.error('获取存储的用户信息失败', err)
  }
})

const handleOrder = () => {
  if (!userInfo.value) {
    Taro.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  // 跳转到订单列表页面
  Taro.navigateTo({
    url: '/pages/order/list/index'
  })
}

const handleHistory = () => {
  if (!userInfo.value) {
    Taro.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }
  // 跳转到鉴定记录页面
  Taro.navigateTo({
    url: '/pages/history/index'
  })
}

const handleService = () => {
  // 跳转到联系作者页面
  Taro.navigateTo({
    url: '/pages/contact/index'
  })
}

const handleAbout = () => {
  // 跳转到设置页面
  Taro.navigateTo({
    url: '/pages/settings/index'
  })
}

const goToUserInfo = () => {
  Taro.navigateTo({
    url: '/pages/userInfo/index'
  })
}

const handleLogout = async () => {
  Taro.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async function (res) {
      if (res.confirm) {
        // 清除用户信息和token
        const res = await Taro.request({
          url: `${BASE_URL}/user/logout`,
          method: 'GET',
          header: {
            'sessionId': Taro.getStorageSync('token')
          }
        })
        if (res.statusCode === 200){
          if (res.data.code !== 200){
            throw new Error(res.data.msg || '退出登录失败')
          }
          userInfo.value = null
          Taro.removeStorageSync('userInfo')
          Taro.removeStorageSync('token')
          console.log('用户已退出登录')
        }

        // 立即关闭所有页面，打开个人中心页面
        // Taro.reLaunch({
        //   url: '/pages/profile/index'
        // })
      }
    }
  })
}
</script>

<style lang="scss">
.profile-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 32px;

  .user-info {
    background-color: #ffffff;
    padding: 40px 20px;
    margin-bottom: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .login-text {
        margin-top: 12px;
        color: #333;
        font-size: 16px;
      }
    }

    .user-detail {
      display: flex;
      align-items: center;
      padding: 20px;
      background: #ffffff;
      
      .avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin-right: 12px;
        
        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }
      
      .nickname-container {
        flex: 1;
        display: flex;
        align-items: center;
        
        .nickname {
          font-size: 16px;
          color: #333;
          font-weight: 600;
          margin-right: 8px;
        }
        
        .member-badge {
          background-color: #FFD700;
          color: #8B4513;
          font-size: 12px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      }

      .arrow-icon {
        color: #999;
        padding: 8px;
      }
    }
  }

  .menu-list {
    background-color: transparent;
    margin: 0 12px;
    padding: 8px 12px;

    .logout-section {
      margin-top: 20px;
      padding: 0 6px;

      .logout-btn {
        width: 100%;
        height: 44px;
        border-radius: 6px;
        font-size: 15px;
        color: #333;
        background: #ffffff;
        border: none;

        &:active {
          opacity: 0.9;
        }
      }
    }
  }
}

/* NutUI 组件样式覆盖 */
.nut-cell {
  padding: 14px !important;
  margin: 6px 0 !important;
  background-color: #ffffff !important;
  border-radius: 6px !important;
}

.nut-cell__title {
  font-size: 15px !important;
  color: #333 !important;
}

.nut-cell__icon {
  margin-right: 8px !important;
  color: #666 !important;
}

.nut-cell-group {
  margin: 0 !important;
  background: transparent !important;
  --nutui-cell-group-background: transparent !important;
}
</style> 