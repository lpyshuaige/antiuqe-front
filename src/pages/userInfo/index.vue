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
import BASE_URL from "../../utils/request";

const userInfo = ref({
  avatarUrl: '',
  nickname: ''
})

// 处理头像选择
const onChooseAvatar = (e) => {
  const { avatarUrl } = e.detail
  userInfo.value.avatarUrl = avatarUrl
}

// 处理昵称修改
const onNickNameChange = (e) => {
  const { value } = e.detail
  userInfo.value.nickname = value
}

// 处理确定按钮点击
const handleConfirm = async () => {
  // 保存用户信息
  try {
    console.log('开始上传文件，参数：', {
      avatarUrl: userInfo.value.avatarUrl,
      nickname: userInfo.value.nickname,
      token: Taro.getStorageSync('token')
    })

    // 直接调用上传接口
    const res = await Taro.uploadFile({
      url: `${BASE_URL}/user/userAuth`,
      filePath: userInfo.value.avatarUrl,
      name: 'avatar',
      formData: {
        'nickname': userInfo.value.nickname
      },
      header: {
        'sessionId': Taro.getStorageSync('token')
      }
    })

    console.log('上传响应：', res)

    if (res.statusCode === 200) {
      const responseData = JSON.parse(res.data)
      if (responseData.code !== 200) {
        throw new Error(responseData.msg || '服务器返回错误')
      }
      console.log('修改信息成功：', responseData)

      // 获取原有的用户信息
      const existingUserInfo = Taro.getStorageSync('userInfo') || {}

      // 更新本地存储的用户信息，保留原有字段
      const newUserInfo = {
        ...existingUserInfo,
        avatarUrl: responseData.data.avatarUrl,
        nickname: responseData.data.nickname
      }
      Taro.setStorageSync('userInfo', newUserInfo)
      console.log('更新用户信息成功：', newUserInfo)
      Taro.showToast({
        title: '修改成功',
        icon: 'success'
      })
    } else {
      throw new Error(`请求失败，状态码：${res.statusCode}`)
    }
  } catch (error) {
    console.error('修改详细错误：', error)
    Taro.showToast({
      title: '修改失败，请重试',
      icon: 'error'
    })
  }

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