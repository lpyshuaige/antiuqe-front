<template>
  <view class="order-list-container">
    <view class="header">
      <text class="title">我的订单</text>
    </view>

    <!-- 加载中状态 -->
    <view v-if="loading && orderPoList.length === 0" class="loading-container">
      <view class="loading-icon"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <nut-empty v-else-if="orderPoList.length === 0 && !loading" 
      description="暂时没有订单"
      image="empty">
    </nut-empty>

    <view v-else class="order-list">
      <view 
        v-for="(order, index) in orderPoList" 
        :key="order.id" 
        class="order-item"
      >
        <view class="order-content">
          <view class="order-info">
            <view class="info-row">
              <text class="label">支付用途</text>
              <text class="value">{{ order.inform ? '开通会员' : '单次解锁报告' }}</text>
            </view>
            <view class="info-row">
              <text class="label">支付金额</text>
              <text class="value price">¥{{ formatAmount(order.amount) }}</text>
            </view>
            <view class="info-row">
              <text class="label">创建时间</text>
              <text class="value time">{{ formatTime(order.createdTime) }}</text>
            </view>
          </view>
          <view class="order-action" v-if="!order.isPaid">
            <nut-button 
              type="primary" 
              size="small" 
              class="pay-btn"
              @click="handlePay(order)"
            >
              支付
            </nut-button>
            <nut-button 
              type="default" 
              size="small" 
              class="cancel-btn"
              @click="handleCancel(order)"
            >
              取消
            </nut-button>
          </view>
          <view class="order-status" v-else>
            <text class="status-text">已支付</text>
          </view>
        </view>
      </view>

      <!-- 分页组件 -->
      <view class="pagination-wrapper">
        <nut-pagination
          v-model="currentPage"
          :total-items="totalItems"
          :items-per-page="pageSize"
          :page-count="totalPages"
          mode="simple"
          @change="onPageChange"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro, {useDidShow} from '@tarojs/taro'
import BASE_URL from "../../../utils/request";


// 订单列表
const orderPoList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const totalItems = ref(0)

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / pageSize.value) || 1
})

const initialLoad = ref(true)

// 获取订单列表
const fetchOrders = async (page = 1) => {
  if (loading.value) return Promise.resolve()
  
  // 验证页码
  if (page < 1) page = 1
  if (totalPages.value > 0 && page > totalPages.value) page = totalPages.value
  
  loading.value = true
  console.log('获取订单列表，页码，每页记录数：', page, pageSize.value)
  
  try {
    const token = Taro.getStorageSync('token')
    if (!token) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      })
      Taro.navigateTo({
        url: '/pages/profile/index'
      })
      return Promise.resolve()
    }
    
    const res = await Taro.request({
      url: `${BASE_URL}/order/listOrder?page=${page}&pageSize=${pageSize.value}`,
      method: 'GET',
      header: {
        'sessionId': token
      }
    })
    
    console.log('订单列表响应：', res)
    
    if (res.statusCode === 200 && res.data.code === 200) {
      // 设置总记录数和订单列表
      const { total, orderPoList: orders } = res.data.data
      totalItems.value = total || 0
      orderPoList.value = orders || []
      currentPage.value = page
      
      console.log('当前页码:', page, '每页条数:', pageSize.value, '总记录数:', totalItems.value, '总页数:', totalPages.value)
    } else {
      Taro.showToast({
        title: res.data.msg || '获取订单失败',
        icon: 'none'
      })
      // 请求失败时确保orderPoList为空数组
      orderPoList.value = []
    }
    return Promise.resolve()
  } catch (error) {
    console.error('获取订单列表失败', error)
    Taro.showToast({
      title: '网络错误',
      icon: 'none'
    })
    // 发生错误时确保orderPoList为空数组
    orderPoList.value = []
    return Promise.reject(error)
  } finally {
    loading.value = false
  }
}

// 格式化金额（分转元）
const formatAmount = (amount: number) => {
  return (amount / 100).toFixed(2)
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  // 处理字符串格式的时间戳
  let date
  if (typeof timestamp === 'string') {
    // 兼容iOS的日期格式处理
    if (timestamp.includes(' ')) {
      timestamp = timestamp.replace(' ', 'T')
    }
    
    date = new Date(timestamp)
    
    if (isNaN(date.getTime())) {
      const parts = timestamp.replace('T', ' ').split(/[- :]/)
      if (parts.length >= 6) {
        date = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2]),
          parseInt(parts[3]),
          parseInt(parts[4]),
          parseInt(parts[5])
        )
      } else if (parts.length >= 3) {
        date = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2])
        )
      }
    }
  } else {
    date = new Date(timestamp)
  }
  
  if (!date || isNaN(date.getTime())) {
    console.error('无效的日期格式:', timestamp)
    return ''
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 处理支付
const handlePay = (order) => {
  // 将订单数据转换为查询字符串
  const orderData = encodeURIComponent(JSON.stringify(order))
  
  // 跳转到订单详情页
  Taro.navigateTo({
    url: `/pages/order/detail/index?orderData=${orderData}`
  })
}

// 处理取消
const handleCancel = (order) => {
  Taro.showModal({
    title: '提示',
    content: '确定取消本次订单吗？',
    success: async function (res) {
      if (res.confirm) {
        try {
          const token = Taro.getStorageSync('token')
          if (!token) {
            Taro.showToast({
              title: '请先登录',
              icon: 'none'
            })
            return
          }

          const response = await Taro.request({
            url: `${BASE_URL}/order/deleteOrder?orderId=${order.id}`,
            method: 'POST',
            header: {
              'sessionId': token
            }
          })

          console.log('取消订单响应：', response)

          if (response.statusCode === 200 && response.data.code === 200) {
            Taro.showToast({
              title: '订单已取消',
              icon: 'success'
            })
            // 刷新订单列表
            await fetchOrders(currentPage.value)
          } else {
            Taro.showToast({
              title: response.data.msg || '取消订单失败',
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('取消订单失败:', error)
          Taro.showToast({
            title: '网络错误',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 页面切换
const onPageChange = (page) => {
  if (page < 1 || (totalPages.value > 0 && page > totalPages.value)) return
  console.log('页面切换到：', page)
  fetchOrders(page)
}

// 页面加载时获取订单列表
onMounted(() => {
  console.log('订单列表页面初次加载')
  fetchOrders(1).then(() => {
    console.log('订单列表初次加载完成')
    initialLoad.value = false
  })
})

useDidShow(() => {
  if (!initialLoad.value){
    console.log('回到订单列表页面，刷新', currentPage.value)
    fetchOrders(currentPage.value)
  }

})
</script>

<style lang="scss">
.order-list-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 32px;
  
  .header {
    background-color: #fff;
    padding: 32px 16px 16px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    
    .title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    
    .loading-icon {
      width: 32px;
      height: 32px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #1296db;
      border-radius: 50%;
      margin-bottom: 12px;
      animation: spin 1s linear infinite;
    }
    
    .loading-text {
      font-size: 14px;
      color: #999;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }

  :deep(.nut-empty) {
    padding: 32px 0;
    background-color: #fff;
    border-radius: 12px;
    margin: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .order-list {
    padding: 16px;
    
    .order-item {
      background-color: #fff;
      border-radius: 12px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      
      .order-content {
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .order-info {
          flex: 1;
          
          .info-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            .label {
              font-size: 14px;
              color: #666;
              width: 70px;
            }
            
            .value {
              font-size: 14px;
              color: #333;
              
              &.price {
                font-size: 16px;
                font-weight: 600;
                color: #07c160;
              }
              
              &.time {
                font-size: 12px;
                color: #999;
              }
            }
          }
        }
        
        .order-action {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-left: 16px;
          
          .pay-btn,
          .cancel-btn {
            width: 80px;
            height: 36px;
            border-radius: 18px;
            font-size: 14px;
          }
          
          .cancel-btn {
            background: #f5f5f5;
            border-color: #f5f5f5;
            color: #666;
          }
        }
        
        .order-status {
          margin-left: 16px;

          
          .status-text {
            font-size: 14px;
            color: #07c160;
          }
        }
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      width: 100%;
      margin-top: 24px;

      :deep(.nut-pagination) {
        padding: 12px;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        
        .nut-pagination-simple {
          font-size: 14px;
          color: #666;
          
          &__prev, &__next {
            min-width: 60px;
            height: 32px;
            line-height: 32px;
            border: 1px solid #eee;
            border-radius: 16px;
            background-color: #fff;
            
            &:active {
              background-color: #f5f5f5;
            }
            
            &.disabled {
              opacity: 0.5;
              background-color: #f5f5f5;
            }
          }
          
          &__page {
            margin: 0 12px;
          }
        }
      }
    }
  }
}
</style> 