<template>
  <view class="order-detail">
    <!-- 倒计时区域 -->
    <view class="countdown-section">
      <view class="countdown-wrapper">
        <nut-countdown
          :end-time="endTime"
          format="mm分ss秒"
          @on-end="handleTimeEnd"
        />
      </view>
      <text class="countdown-tip">超过时间未支付则报告会自动删除，需重新鉴定</text>
    </view>

    <!-- 订单信息区域 -->
    <view class="order-info">
      <view class="info-item">
        <text class="label">支付用途</text>
        <text class="value">{{ paymentPurpose }}</text>
      </view>
      <view class="info-item">
        <text class="label">支付金额</text>
        <text class="value price">¥{{ formatAmount(orderData.amount) }}</text>
      </view>
    </view>

    <!-- 按钮区域 -->
    <view class="button-group">
      <nut-button 
        class="cancel-btn"
        type="default"
        @click="handleCancel"
      >
        取消
      </nut-button>
      <nut-button 
        class="pay-btn"
        type="primary"
        @click="handlePay"
      >
        去支付
      </nut-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Taro from '@tarojs/taro'
import { Countdown, Button } from '@nutui/nutui-taro'

// 注册组件
const NutButton = Button
const NutCountdown = Countdown

// 定义订单数据类型
interface OrderData {
  id: string
  userId: string
  isPaid: boolean
  createdTime: string
  amount: number
  inform: boolean
  reportId?: string
}

// 订单数据
const orderData = ref<OrderData>({
  id: '',
  userId: '',
  isPaid: false,
  createdTime: '',
  amount: 0,
  inform: false,
})

// 计算倒计时结束时间（创建时间 + 10分钟）
const endTime = ref(0)

// 计算支付用途文本
const paymentPurpose = computed(() => {
  return orderData.value.inform ? '开通会员' : '购买本次报告'
})

// 格式化金额（分转元）
const formatAmount = (amount: number) => {
  return (amount / 100).toFixed(2)
}

// 倒计时结束处理
const handleTimeEnd = () => {
  Taro.showToast({
    title: '订单已超时',
    icon: 'none'
  })
  // 可以在这里添加自动返回等逻辑
}

// 取消按钮处理
const handleCancel = () => {
  Taro.navigateBack()
}

// 去支付按钮处理
const handlePay = () => {
  Taro.showToast({
    title: '支付功能开发中',
    icon: 'none'
  })
}

onMounted(() => {
  // 获取路由参数中的订单数据
  const params = Taro.getCurrentInstance().router?.params
  if (params?.orderData) {
    try {
      const data = JSON.parse(decodeURIComponent(params.orderData))
      orderData.value = data
      
      // 计算倒计时结束时间（创建时间 + 10分钟）
      const createdTime = new Date(data.createdTime).getTime()
      const now = Date.now()
      
      // 确保创建时间是有效的时间戳
      if (isNaN(createdTime)) {
        console.error('无效的创建时间:', data.createdTime)
        Taro.showToast({
          title: '订单数据错误',
          icon: 'none'
        })
        return
      }

      // 计算结束时间（创建时间 + 10分钟）
      const endTimeStamp = createdTime + 10 * 60 * 1000
      
      console.log('订单创建时间：', new Date(createdTime).toLocaleString())
      console.log('当前时间：', new Date(now).toLocaleString())
      console.log('结束时间：', new Date(endTimeStamp).toLocaleString())
      
      if (now >= endTimeStamp) {
        // 如果已经超时
        handleTimeEnd()
      } else {
        // 设置结束时间的时间戳
        endTime.value = endTimeStamp
      }
    } catch (error) {
      console.error('解析订单数据失败', error)
      Taro.showToast({
        title: '订单数据错误',
        icon: 'none'
      })
    }
  }
})
</script>

<style lang="scss">
.order-detail {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 20px;
  box-sizing: border-box;

  .countdown-section {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    text-align: center;

    .countdown-wrapper {
      margin-bottom: 12px;
    }

    .countdown-tip {
      font-size: 12px;
      color: #999;
    }
  }

  .order-info {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-size: 14px;
        color: #666;
      }

      .value {
        font-size: 14px;
        color: #333;

        &.price {
          font-size: 20px;
          font-weight: 600;
          color: #07c160;
        }
      }
    }
  }

  .button-group {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 12px;

    .cancel-btn,
    .pay-btn {
      flex: 1;
      height: 44px;
      border-radius: 22px;
      font-size: 16px;
    }

    .cancel-btn {
      background: #f5f5f5;
      border-color: #f5f5f5;
      color: #666;
    }

    .pay-btn {
      background: #07c160;
      border-color: #07c160;
    }
  }
}
</style> 