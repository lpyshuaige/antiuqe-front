<template>
  <view class="result-container">
    <!-- 鉴定图片展示 -->
    <view class="image-section">
      <view class="image-grid" :class="gridLayoutClass">
        <view 
          v-for="(image, index) in imageList" 
          :key="index"
          class="image-item"
          @tap="previewImage(image)"
        >
          <image :src="image" mode="aspectFill" class="antique-image" />
        </view>
      </view>
    </view>

    <!-- 鉴定报告区域 -->
    <view class="report-section" v-if="!isLoading">
      <!-- 空状态 -->
      <nut-empty v-if="!reportInfo"
                 description="报告生成失败，请重新选择图片生成"
                 image="error">
      </nut-empty>
      <view class="content-box" v-else>
        <!-- 报告标题 -->
        <view class="report-header">
          <view class="report-title">鉴定报告</view>
          <!-- AI生成内容提示 -->
          <view class="ai-disclaimer">
            <text>* 以下内容由AI生成，仅供参考，请仔细甄别</text>
          </view>
        </view>

        <!-- 报告内容 - Markdown渲染 -->
        <view v-if="markdownData">
          <to-wxml :nodes="markdownData" />
        </view>
        
        <!-- 报告内容 - 传统HTML渲染（备用） -->
        <view
          v-else
          ref="contentRef"
          class="content"
          v-html="formattedContent"
        >
        </view>

        <!-- 非会员时的模糊遮罩和查看完整报告文字 -->
        <view v-if="!canViewFullReport" class="fade-out">
          <view class="view-more" @tap="handleViewMore">
            <text>查看完整报告</text>
            <RectDown size="16" color="#07c160" />
          </view>
        </view>
      </view>
    </view>

    <!-- 支付弹窗 -->
    <nut-popup 
      position="bottom"
      v-model:visible="showPaymentPopup"
      :style="{ borderRadius: '16px 16px 0 0' }"
      :overlay-style="{ background: 'rgba(0, 0, 0, 0.7)' }"
    >
      <view class="payment-popup">
        <view class="popup-header">
          <text class="popup-title">选择开通方式</text>
          <view class="close-icon" @click="showPaymentPopup = false">
            <Close size="20" />
          </view>
        </view>

        <view class="payment-options">
          <view 
            class="payment-option"
            :class="{ active: selectedOption === 'member' }"
            @click="selectedOption = 'member'"
          >
            <view class="option-content">
              <view class="option-title">开通会员</view>
              <view class="option-desc">享受无限次鉴定服务</view>
              <view class="option-price">12元/月</view>
            </view>
            <view class="option-check">
              <CheckChecked 
                v-if="selectedOption === 'member'"
                size="20"
                color="#07c160"
              />
              <CheckNormal 
                v-else
                size="20"
                color="#999"
              />
            </view>
          </view>

          <view 
            class="payment-option"
            :class="{ active: selectedOption === 'single' }"
            @click="selectedOption = 'single'"
          >
            <view class="option-content">
              <view class="option-title">单次鉴定</view>
              <view class="option-desc">仅查看本次完整报告</view>
              <view class="option-price">6元/次</view>
            </view>
            <view class="option-check">
              <CheckChecked 
                v-if="selectedOption === 'single'"
                size="20"
                color="#07c160"
              />
              <CheckNormal 
                v-else
                size="20"
                color="#999"
              />
            </view>
          </view>
        </view>

        <view class="payment-action">
          <nut-button 
            block
            class="confirm-btn"
            @click="handlePayment"
          >
            确认
          </nut-button>
        </view>
      </view>
    </nut-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { Close, CheckNormal, CheckChecked, RectDown } from '@nutui/icons-vue-taro'
import BASE_URL from "../../utils/request";
import towxml from '../../components/towxml/index';
import log from "../../utils/log";

// 页面参数
const imageList = ref<string[]>([])
const canViewFullReport = ref(false)
const showPaymentPopup = ref(false)
const selectedOption = ref('member')
const contentRef = ref(null)
const isLoading = ref(true)
const reportInfo = ref(null)
const reportId = ref('')  // 存储报告ID，用于onShow时重新获取
const markdownData = ref({}) // 存储解析后的markdown数据

// 定义初始显示的内容和完整内容
const markdownContent = ref('')

// 处理Markdown内容
const parseMarkdown = (content) => {
  if (!content) return {}

  try {
    // 如果不能查看完整报告，则只显示部分内容
    let mdContent = content
    if (!canViewFullReport.value) {
      // 计算三分之一的长度
      const oneThirdLength = Math.floor(content.length / 3)
      // 找到最近的段落结束位置
      let cutoffIndex = content.slice(0, oneThirdLength).lastIndexOf('\n\n')
      if (cutoffIndex === -1) {
        cutoffIndex = oneThirdLength
      }
      // 确保不会截断标题
      const lastTitleIndex = content.slice(0, cutoffIndex).lastIndexOf('##')
      if (lastTitleIndex !== -1) {
        cutoffIndex = lastTitleIndex
      }
      mdContent = content.slice(0, cutoffIndex)
    }
    // 使用towxml解析markdown
    return towxml(mdContent, 'markdown')
  } catch (error) {
    log.error('解析Markdown失败:', error)
    return {}
  }
}

// 计算格式化后的内容（作为备用）
const formattedContent = computed(() => {
  if (!reportInfo.value) return ''
  
  let content = ''
  content = reportInfo.value
  // 如果不能查看完整报告，则只显示部分内容
  if (!canViewFullReport.value && content) {
    // 计算三分之一的长度
    const oneThirdLength = Math.floor(content.length / 3)
    // 找到最近的段落结束位置
    let cutoffIndex = content.slice(0, oneThirdLength).lastIndexOf('\n\n')
    if (cutoffIndex === -1) {
      cutoffIndex = oneThirdLength
    }
    // 确保不会截断标题
    const lastTitleIndex = content.slice(0, cutoffIndex).lastIndexOf('##')
    if (lastTitleIndex !== -1) {
      cutoffIndex = lastTitleIndex
    }
    content = content.slice(0, cutoffIndex)
  }
  
  // 将换行符转换为<br/>标签
  return content.replace(/\n/g, '<br/>')
})


// 计算图片网格布局类名
const gridLayoutClass = computed(() => {
  const count = imageList.value.length
  switch (count) {
    case 0: return ''
    case 1: return 'single'
    case 2: return 'two'
    case 3: return 'three'
    case 4: return 'four'
    case 5: return 'five'
    case 6: return 'six'
    default: return ''
  }
})

// 在组件挂载时获取用户信息和页面参数
onMounted(() => {
  isLoading.value = true  // 开始加载
  // 设置导航栏标题
  Taro.setNavigationBarTitle({
    title: '鉴定结果'
  })
  const params = Taro.getCurrentInstance().router?.params
  if (params) {
    // 如果有ID参数，则通过ID获取鉴定记录详情
    if (params.id) {
      reportId.value = params.id  // 保存报告ID
      fetchReportDetail(params.id).then(() => {
        isLoading.value = false  // 加载完成
      })
    } else {
      throw new Error('未找到报告ID')
    }
  }
})

// 页面显示时检查是否需要重新获取报告详情
useDidShow(() => {
  console.log('鉴定报告页面显示，检查是否需要刷新报告状态')
  // 如果有报告ID，重新获取报告详情以更新支付状态
  if (!isLoading.value && reportId.value) {
    fetchReportDetail(reportId.value)
  }
})

// 通过ID获取鉴定记录详情
const fetchReportDetail = async (id) => {
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
      return
    }
    // 获取当前路由参数
    const params = Taro.getCurrentInstance().router?.params
    
    // 如果有传递图片列表参数，先解析并设置
    if (params && params.imageList) {
      try {
        const imageListData = JSON.parse(decodeURIComponent(params.imageList || '[]'))
        imageList.value = imageListData
      } catch (error) {
        log.error('解析图片列表参数失败', error)
      }
    }
    
    const res = await Taro.request({
      url: `${BASE_URL}/report/getDetail`,
      method: 'GET',
      data: { id },
      header: {
        'sessionId': token
      }
    })
    if (res.statusCode === 200 && res.data.code === 200) {
      const { id, info, canShow } = res.data.data
      // 根据后端返回的canShow字段决定用户是否能查看完整报告
      canViewFullReport.value = canShow
      // 设置报告内容 - 简化处理，直接使用info字符串
      if (info) {
        reportInfo.value = info
        markdownContent.value = info
        // 解析markdown内容
        markdownData.value = parseMarkdown(info)
      }
    } else {
      log.error('获取鉴定记录详情失败', res.data.msg)
      Taro.showToast({
        title: res.data.msg || '获取详情失败',
        icon: 'none'
      })
    }
  } catch (error) {
    log.error('获取鉴定记录详情失败', error)
    Taro.showToast({
      title: '网络错误',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 处理支付
const handlePayment = async () => {
  try {
    const token = Taro.getStorageSync('token')
    if (!token) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    // 准备请求参数和URL
    let url = `${BASE_URL}/order/createOrder`
    
    // 只有在单次鉴定时才添加reportId参数
    if (selectedOption.value === 'single') {
      const currentParams = Taro.getCurrentInstance().router?.params
      if (currentParams?.id) {
        url += `?reportId=${currentParams.id}`
      }
    }
    // 调用创建订单接口
    const res = await Taro.request({
      url: url,
      method: 'POST',
      header: {
        'sessionId': token
      }
    })

    if (res.statusCode === 200 && res.data.code === 200) {
      // 关闭支付弹窗
      showPaymentPopup.value = false
      
      // 将订单数据转换为查询字符串
      const orderData = res.data.data
      const queryString = encodeURIComponent(JSON.stringify(orderData))
      
      // 跳转到订单详情页
      Taro.navigateTo({
        url: `/pages/order/detail/index?orderData=${queryString}`
      })
    } else {
      log.error('创建订单失败', res.data.msg)
      Taro.showToast({
        title: res.data.msg || '创建订单失败',
        icon: 'none'
      })
    }
  } catch (error) {
    log.error('创建订单失败', error)
    Taro.showToast({
      title: '网络错误',
      icon: 'none'
    })
  }
}

// 修改预览图片方法
const previewImage = (current: string) => {
  Taro.previewImage({
    current,
    urls: imageList.value
  })
}

// 修改 handleViewMore 方法
const handleViewMore = () => {
  showPaymentPopup.value = true
}
</script>

<style lang="scss">
.result-container {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  flex-direction: column;
  align-items: center;

  .image-section {
    width: 100%;
    padding: 12px;
    background: #fff;
    margin-bottom: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    
    .image-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin: 0 auto;
      width: auto;
      max-width: 100%;
      
      .image-item {
        position: relative;
        padding-bottom: 100%; // 保持1:1的宽高比
        border-radius: 8px;
        overflow: hidden;
        background: #f8f8f8;
        
        .antique-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      // 根据图片数量调整布局
      &.single {
        display: flex;
        justify-content: center;
        align-items: center;
        grid-template-columns: none;
        max-width: 240px;
        width: 240px;
        height: 240px;
        margin: 0 auto;
        
        .image-item {
          position: relative;
          width: 240px;
          height: 240px;
          padding: 0;
          margin: 0;
          
          .antique-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
            border: 1px solid #eee;
            background-color: #fff;
            border-radius: 8px;
          }
        }
      }

      &.two {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        max-width: 280px;
        width: 280px;
        margin: 0 auto;
        
        .image-item {
          position: relative;
          padding-bottom: 100%;
          width: 100%;
          height: 0;
          
          .antique-image {
            border: 1px solid #eee;
          }
        }
      }

      &.three {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        max-width: 360px;
        width: 360px;
        margin: 0 auto;
        
        .image-item {
          position: relative;
          padding-bottom: 100%;
          width: 100%;
          height: 0;
          
          .antique-image {
            border: 1px solid #eee;
          }
        }
      }

      &.four {
        display: grid; /* 确保使用grid布局 */
        grid-template-columns: repeat(2, 1fr);
        max-width: 320px;
        width: 320px;
        margin: 0 auto;
        
        .image-item {
          position: relative;
          padding-bottom: 100%;
          width: 100%;
          height: 0;
          
          .antique-image {
            border: 1px solid #eee;
          }
        }
      }

      &.five,
      &.six {
        display: grid; /* 确保使用grid布局 */
        grid-template-columns: repeat(3, 1fr);
        max-width: 360px;
        width: 360px;
        margin: 0 auto;
        
        .image-item {
          position: relative;
          padding-bottom: 100%;
          width: 100%;
          height: 0;
          
          .antique-image {
            border: 1px solid #eee;
          }
        }
      }
    }
  }

  .report-section {
    width: 100%;
    max-width: 650px; /* 设置最大宽度 */
    margin: 12px auto;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-sizing: border-box;

    .content-box {
      position: relative;
      width: 100%;
      overflow: hidden;

      .ai-disclaimer {
        text-align: center;

        text {
          font-size: 12px;
          color: #999;
          font-style: italic;
        }
      }

      .report-header {
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #eee;

        .report-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
          text-align: center;
        }

        .report-meta {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          
          .meta-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            flex: 1;
            min-width: 120px;
            
            .meta-label {
              font-size: 14px;
              color: #666;
              margin-right: 4px;
            }
            
            .meta-value {
              font-size: 14px;
              color: #333;
              font-weight: 500;
            }
          }
        }
      }

      .content {
        font-size: 14px;
        line-height: 1.8;
        color: #333;
        text-align: justify;
        padding: 8px 0;
      }

      .fade-out {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 120px;
        background: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.4) 15%,
          rgba(255, 255, 255, 0.8) 50%,
          rgba(255, 255, 255, 0.95) 80%,
          white 100%
        );
        display: flex;
        justify-content: center;
        align-items: flex-end;
        padding-bottom: 16px;

        .view-more {
          color: #07c160;
          font-size: 14px;
          font-weight: 400;
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 4px 0;

          &:active {
            opacity: 0.8;
          }
        }
      }
    }
  }
}

.payment-popup {
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 16px;

    .popup-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .close-icon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
      padding: 4px;
    }
  }

  .payment-options {
    padding: 0 16px;

    .payment-option {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #f8f8f8;
      border-radius: 8px;
      margin-bottom: 12px;
      border: 1px solid transparent;

      &.active {
        background: #f0fff4;
        border-color: #07c160;
      }

      .option-content {
        flex: 1;

        .option-title {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .option-desc {
          font-size: 12px;
          color: #999;
          margin-bottom: 8px;
        }

        .option-price {
          font-size: 20px;
          font-weight: 600;
          color: #07c160;
        }
      }

      .option-check {
        margin-left: 12px;
      }
    }
  }

  .payment-action {
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));

    .confirm-btn {
      height: 44px;
      border-radius: 22px;
      font-size: 16px;
      background: #07c160;
      border-color: #07c160;

      &:active {
        opacity: 0.9;
      }
    }
  }
}
</style> 