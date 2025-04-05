<template>
  <view class="history-container">
    <view class="header">
      <text class="title">鉴定记录</text>
    </view>

    <!-- 加载中状态 -->
    <view v-if="loading && recordList.length === 0" class="loading-container">
      <view class="loading-icon"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <nut-empty v-else-if="recordList.length === 0 && !loading" 
      description="暂时没有记录"
      image="empty">
    </nut-empty>

    <view v-else class="record-list">
      <view 
        v-for="(record, index) in recordList" 
        :key="record.id" 
        class="record-item"
      >
        <view class="record-content">
          <view class="image-container">
            <view class="image-list">
              <image 
                v-for="(img, imgIndex) in record.imageList.slice(0, 2)"
                :key="imgIndex" 
                :src="img" 
                mode="aspectFill" 
                class="record-image" 
              />
            </view>
            <view v-if="record.isFinished" class="record-time">
              {{ formatTime(record.finishedTime) }}
            </view>
          </view>
          <view class="record-action">
            <nut-button 
              type="primary" 
              size="small" 
              class="view-btn"
              :disabled="!record.isFinished"
              @click="viewReport(record)"
            >
              {{ record.isFinished ? '查看' : '生成中' }}
            </nut-button>
            <nut-button 
              type="default" 
              size="small" 
              class="delete-btn"
              @click="handleDelete(record)"
            >
              删除
            </nut-button>
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
import {computed, onMounted, ref} from 'vue'
import Taro from '@tarojs/taro'
import BASE_URL from "../../utils/request";
import log from "../../utils/log";


// 记录列表
const recordList = ref([])
const currentPage = ref(1)
const pageSize = ref(5)
const loading = ref(false)
const totalItems = ref(0)

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / pageSize.value) || 1
})

// 获取鉴定记录
const fetchRecords = async (page = 1) => {
  if (loading.value) return Promise.resolve()
  
  // 验证页码
  if (page < 1) page = 1
  if (totalPages.value > 0 && page > totalPages.value) page = totalPages.value
  
  loading.value = true
  
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
      url: `${BASE_URL}/report/listReport?page=${page}&pageSize=${pageSize.value}`,
      method: 'GET',
      header: {
        'sessionId': token
      }
    })
    if (res.statusCode === 200 && res.data.code === 200) {
      // 设置总记录数和记录列表
      const { total, reportList } = res.data.data
      totalItems.value = total

      recordList.value = reportList.map(item => {
        // 解析图片列表
        let imageList = []
        try {
          imageList = typeof item.imageList === 'string'
              ? JSON.parse(item.imageList)
              : item.imageList
        } catch (e) {
          log.error('解析图片列表失败', e)
          imageList = []
        }

        return {
          id: item.id,
          orderId: item.order_id,
          finishedTime: item.finishedTime,
          imageList: imageList,
          // 最多显示2张图片
          //displayImages: imageList.slice(0, 2),
          // 判断报告是否已生成完毕
          isFinished: !!item.finishedTime
        }
      })
      currentPage.value = page
    } else {
      log.error('获取记录失败', res.data.msg)
      Taro.showToast({
        title: res.data.msg || '获取记录失败',
        icon: 'none'
      })
    }
    return Promise.resolve()
  } catch (error) {
    log.error('获取鉴定记录失败', error)
    Taro.showToast({
      title: '网络错误',
      icon: 'none'
    })
    return Promise.reject(error)
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  // 处理字符串格式的时间戳
  let date
  if (typeof timestamp === 'string') {
    // 兼容iOS的日期格式处理
    if (timestamp.includes(' ')) {
      // 将 "yyyy-MM-dd HH:mm:ss" 转换为 "yyyy-MM-ddTHH:mm:ss"
      timestamp = timestamp.replace(' ', 'T')
    }
    
    // 尝试解析日期
    date = new Date(timestamp)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      // 如果无效，尝试手动解析
      const parts = timestamp.replace('T', ' ').split(/[- :]/)
      if (parts.length >= 6) {
        // 格式: yyyy-MM-dd HH:mm:ss 或 yyyy-MM-ddTHH:mm:ss
        date = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1, // 月份从0开始
          parseInt(parts[2]),
          parseInt(parts[3]),
          parseInt(parts[4]),
          parseInt(parts[5])
        )
      } else if (parts.length >= 3) {
        // 格式: yyyy-MM-dd
        date = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2])
        )
      }
    }
  } else {
    // 处理数字类型的时间戳
    date = new Date(timestamp)
  }
  
  // 检查日期是否有效
  if (!date || isNaN(date.getTime())) {
    log.error('无效的日期格式:', timestamp)
    return ''
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 查看报告详情
const viewReport = (record) => {
  if (!record.isFinished) return
  // 将完整的图片列表作为参数传递
  const params = {
    id: record.id,
    imageList: encodeURIComponent(JSON.stringify(record.imageList))
  }
  
  // 构建URL并导航到详情页
  const url = `/pages/result/index?id=${params.id}&imageList=${params.imageList}`
  Taro.navigateTo({ url })
}

// 页面切换
const onPageChange = (page) => {
  if (page < 1 || (totalPages.value > 0 && page > totalPages.value)) return
  fetchRecords(page)
}

// 添加删除报告的处理函数
const handleDelete = (record) => {
  // 自定义提示信息，根据报告状态不同显示不同内容
  const confirmMessage = record.isFinished 
    ? '确定删除这条鉴定记录吗？' 
    : '该记录尚未生成完成，确定删除吗？';
    
  Taro.showModal({
    title: '提示',
    content: confirmMessage,
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
          loading.value = true
          // 调用删除接口
          const response = await Taro.request({
            url: `${BASE_URL}/report/deleteReport?id=${record.id}`,
            method: 'POST',
            header: {
              'sessionId': token
            }
          })
          if (response.statusCode === 200 && response.data.code === 200) {
            Taro.showToast({
              title: '删除成功',
              icon: 'success'
            })
            loading.value = false
            // 刷新记录列表
            await fetchRecords(currentPage.value)
          } else {
            log.error('删除记录失败', response.data.msg)
            Taro.showToast({
              title: response.data.msg || '删除失败',
              icon: 'none'
            })
          }
        } catch (error) {
          log.error('删除记录失败:', error)
          Taro.showToast({
            title: '网络错误',
            icon: 'none'
          })
        } finally {
          loading.value = false
        }
      }
    }
  })
}

// 页面加载时获取记录
onMounted(() => {
  fetchRecords(1)
})
</script>

<style lang="scss">
.history-container {
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
  
  .record-list {
    padding: 16px;
    
    .record-item {
      background-color: #fff;
      border-radius: 12px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      
      .record-content {
        padding: 16px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .image-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          
          .image-list {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
            max-width: 208px; /* 两张图片的宽度(100px*2)加上间距(8px) */
            
            .record-image {
              width: 100px;
              height: 100px;
              border-radius: 8px;
              object-fit: cover;
              border: 1px solid #eee;
            }
          }
          
          .record-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }
        }
        
        .record-action {
          margin-left: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          
          .view-btn {
            width: 80px;
            height: 36px;
            border-radius: 18px;
            font-size: 14px;
            
            &[disabled] {
              opacity: 0.6;
            }
          }
          
          .delete-btn {
            width: 80px;
            height: 36px;
            border-radius: 18px;
            font-size: 14px;
            background: #f5f5f5;
            border-color: #f5f5f5;
            color: #666;
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