<template>
  <view class="settings-container">
    <view class="settings-list">
      <view class="settings-item">
        <view class="item-label">个性化推荐</view>
        <view class="item-content">
          <nut-switch v-model="isPersonalized" active-color="#07c160" @change="handleSwitchChange" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Taro from '@tarojs/taro'

// 个性化推荐开关状态
const isPersonalized = ref(true)

// 保存开关状态
const savePersonalizedSetting = (value) => {
  console.log('保存个性化推荐设置:', value)
  try {
    Taro.setStorageSync('personalized_setting', value)
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

// 处理开关变化
const handleSwitchChange = (value) => {
  console.log('个性化推荐状态变更为:', value)
  savePersonalizedSetting(value)
}

// 在组件挂载时设置导航栏标题并恢复开关状态
onMounted(() => {
  // 设置导航栏标题
  Taro.setNavigationBarTitle({
    title: '设置'
  })

  // 恢复开关状态
  try {
    const savedSetting = Taro.getStorageSync('personalized_setting')
    console.log('读取保存的设置:', savedSetting)
    if (savedSetting !== null && savedSetting !== undefined) {
      isPersonalized.value = savedSetting
    }
  } catch (error) {
    console.error('读取设置失败:', error)
  }
})

// 监听开关状态变化自动保存设置
watch(isPersonalized, (newValue) => {
  savePersonalizedSetting(newValue)
})
</script>

<style lang="scss">
.settings-container {
  min-height: 100vh;
  background: #f8f8f8;
  padding-top: 12px;

  .settings-list {
    background: #fff;
    border-radius: 8px;
    margin: 0 12px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

    .settings-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }

      .item-label {
        font-size: 16px;
        color: #333;
      }

      .item-content {
        display: flex;
        align-items: center;
      }
    }
  }
}
</style> 