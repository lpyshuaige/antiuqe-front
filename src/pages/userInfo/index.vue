<template>
  <view class="userinfo-container">
    <!-- 头像项 -->
    <view class="info-item">
      <text class="item-label">头像</text>
      <view class="item-content">
        <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <nut-avatar size="small" class="user-avatar">
            <img :src="userInfo.avatarUrl" class="avatar-img" />
          </nut-avatar>
        </button>
      </view>
    </view>

    <!-- 昵称项 -->
    <view class="info-item">
      <text class="item-label">昵称</text>
      <view class="item-content">
        <input 
          type="nickname" 
          class="nickname-input" 
          :value="userInfo.nickName" 
          @change="onNickNameChange"
          placeholder="请输入昵称" 
        />
      </view>
    </view>

    <!-- 确定按钮 -->
    <view class="button-section">
      <nut-button 
        type="primary" 
        class="confirm-btn"
        @click="handleConfirm"
      >
        确定
      </nut-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'

const userInfo = ref({
  avatarUrl: '',
  nickName: ''
})

// 处理头像选择
const onChooseAvatar = (e) => {
  const { avatarUrl } = e.detail
  userInfo.value.avatarUrl = avatarUrl
}

// 处理昵称修改
const onNickNameChange = (e) => {
  const { value } = e.detail
  userInfo.value.nickName = value
}

// 处理确定按钮点击
const handleConfirm = () => {
  // 保存用户信息
  Taro.setStorageSync('userInfo', userInfo.value)
  
  Taro.showToast({
    title: '修改成功',
    icon: 'success'
  })

  // 返回上一页
  setTimeout(() => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({
        url: '/pages/profile/index'
      })
    }
  }, 1500)
}

onMounted(() => {
  // 设置导航栏标题
  Taro.setNavigationBarTitle({
    title: '个人信息'
  })

  // 获取用户信息
  try {
    const profile = Taro.getStorageSync('userInfo')
    if (profile) {
      userInfo.value = profile
    }
  } catch (err) {
    console.error('获取用户信息失败', err)
  }
})
</script>

<style lang="scss">
.userinfo-container {
  min-height: 100vh;
  background: #f8f8f8;
  padding-top: 12px;

  .info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: #fff;
    border-bottom: 1px solid #f5f5f5;

    .item-label {
      font-size: 16px;
      color: #333;
    }

    .item-content {
      display: flex;
      align-items: center;

      .avatar-wrapper {
        padding: 0;
        width: auto;
        background: none;
        border: none;
        line-height: 1;

        &::after {
          border: none;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;

          .avatar-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
        }
      }

      .nickname-input {
        font-size: 16px;
        color: #999;
        text-align: right;
        min-width: 100px;
      }
    }
  }

  .button-section {
    margin: 32px 16px;
    display: flex;
    justify-content: center;

    .confirm-btn {
      width: 120px;
      height: 40px;
      border-radius: 20px;
      font-size: 15px;
      background: #07c160;
      border-color: #07c160;

      &:active {
        opacity: 0.9;
      }
    }
  }
}
</style> 