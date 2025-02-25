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
        <text class="nickname">{{ userInfo.nickName }}</text>
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
        <nut-cell title="联系作者" is-link @click="handleService">
          <template #icon><IconFont name="service" size="16"></IconFont></template>
        </nut-cell>
        <nut-cell title="关于作者" is-link @click="handleAbout">
          <template #icon><IconFont name="issue" size="16"></IconFont></template>
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
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { IconFont } from "@nutui/icons-vue"
import LoginPopup from '../../components/LoginPopup.vue'
import AuthPopup from '../../components/AuthPopup.vue'

const userInfo = ref(null)
const showLoginPopup = ref(false)
const showAuthPopup = ref(false)

// 处理登录点击
const handleLogin = () => {
  showLoginPopup.value = true
}

// 处理登录响应
const handleLoginResponse = (isAuth: boolean) => {
  showLoginPopup.value = false
  // 检查授权状态
  const userInfo = Taro.getStorageSync('userInfo')
  if (!userInfo || !userInfo.avatarUrl || !userInfo.nickName) {
    // 未授权，显示授权弹窗
    showAuthPopup.value = true
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
  Taro.setStorageSync('userInfo', info)
  Taro.showToast({
    title: '登录成功',
    icon: 'success'
  })
}

// 处理授权弹窗关闭
const handleAuthClose = () => {
  showAuthPopup.value = false
}

// 在组件挂载时检查是否有用户信息
onMounted(() => {
  try {
    const profile = Taro.getStorageSync('userInfo')
    if (profile) {
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
  // 跳转到订单页面
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
}

const handleService = () => {
  // 打开客服会话
  Taro.showToast({
    title: '暂未开放',
    icon: 'none'
  })
}

const handleAbout = () => {
  // 跳转到关于我们页面
  Taro.showToast({
    title: '暂未开放',
    icon: 'none'
  })
}

const goToUserInfo = () => {
  Taro.navigateTo({
    url: '/pages/userInfo/index'
  })
}

const handleLogout = () => {
  Taro.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: function (res) {
      if (res.confirm) {
        // 清除用户信息和token
        Taro.removeStorageSync('userInfo')
        Taro.removeStorageSync('token')
        console.log('用户已退出登录')
        
        // 立即关闭所有页面，打开个人中心页面
        Taro.reLaunch({
          url: '/pages/profile/index'
        })
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
      
      .nickname {
        flex: 1;
        font-size: 16px;
        color: #333;
        font-weight: 600;
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