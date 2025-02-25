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
      <view class="content-box">
        <!-- 报告内容 -->
        <view
          ref="contentRef"
          class="content"
        >
          {{ displayContent }}
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
              <view class="option-price">¥39.9/月</view>
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
              <view class="option-price">¥9.9/次</view>
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
            确认支付
          </nut-button>
        </view>
      </view>
    </nut-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import Taro from '@tarojs/taro'
import { Close, CheckNormal, CheckChecked, RectDown } from '@nutui/icons-vue-taro'

// 页面参数
const imageList = ref<string[]>([])
const canViewFullReport = ref(false)
const showPaymentPopup = ref(false)
const selectedOption = ref('member')
const userInfo = ref(null)
const contentRef = ref(null)
const isLoading = ref(true)

// 定义初始显示的内容和完整内容
const fullContent = ref(`这件藏品是一件清代中期的青花瓷瓶，整体保存状况良好。瓷瓶高约28厘米，口径8厘米，底径10厘米。器型端庄秀丽，比例协调。

从工艺特征来看，胎体细腻洁白，胎质纯净，釉面光润均匀，无明显气泡和开片。青花发色沉稳，呈现典型的清代中期特征，其中蓝料的层次分明，深浅过渡自然。

纹饰内容以传统的缠枝莲纹为主题，构图疏密有致。主体纹样分为三层：口沿处饰缠枝花卉纹，腹部绘制缠枝莲纹主题图案，底部为如意云头纹。笔法流畅自然，线条劲挺有力，体现了较高的制作水平。

从器形来看，口沿外撇，短颈，丰肩，腹部渐收，圈足外撇，整体造型典雅大方，符合清代官窑的审美特点。底部有双圈圆足，足墙规整，修足工艺精细。

釉色呈现莹润的象牙白，釉层均匀，无明显积釉现象。在釉面光泽度、釉层厚薄的控制上都显示出很好的烧造水平。底足露胎处可见细腻的胎骨，呈现淡淡的米黄色，这是清代中期瓷器的典型特征之一。

综合来看，这件青花瓷瓶的胎釉质量、装饰风格、工艺水平都达到了较高的标准，具有较高的收藏价值。建议注意保养，避免剧烈碰撞和温差变化，以保持其良好的保存状态。`)

// 计算当前显示的内容
const displayContent = computed(() => {
  if (canViewFullReport.value) {
    return fullContent.value
  }
  // 计算三分之一的长度
  const oneThirdLength = Math.floor(fullContent.value.length / 3)
  // 找到最近的段落结束位置
  let cutoffIndex = fullContent.value.slice(0, oneThirdLength).lastIndexOf('\n\n')
  if (cutoffIndex === -1) {
    cutoffIndex = oneThirdLength
  }
  return fullContent.value.slice(0, cutoffIndex)
})

// 详细信息（仅会员可见）
const detailInfo = ref([])

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

  // 获取用户信息和会员状态
  try {
    const profile = Taro.getStorageSync('userInfo')
    if (profile) {
      userInfo.value = profile
    }
  } catch (err) {
    console.error('获取用户信息失败', err)
  }

  const params = Taro.getCurrentInstance().router?.params
  if (params) {
    // 获取并设置图片列表
    try {
      const imageListData = JSON.parse(decodeURIComponent(params.imageList || '[]'))
      imageList.value = imageListData
    } catch (error) {
      console.error('解析图片列表失败', error)
    }
    
    // 获取并设置详细信息（仅会员）
    if (canViewFullReport.value && params.detailInfo) {
      try {
        const detailInfoData = JSON.parse(decodeURIComponent(params.detailInfo || '[]'))
        detailInfo.value = detailInfoData
      } catch (error) {
        console.error('解析详细信息失败', error)
      }
    }
  }

  // 直接设置isLoading为false
  isLoading.value = false
})

// 处理支付
const handlePayment = () => {
  // 设置为可以查看完整报告
  canViewFullReport.value = true
  // 关闭支付弹窗
  showPaymentPopup.value = false
  // 提示用户
  Taro.showToast({
    title: '查看完整报告',
    icon: 'success'
  })
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

  .image-section {
    width: 100%;
    padding: 12px;
    background: #fff;
    margin-bottom: 12px;
    
    .image-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin: 0 auto;
      
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
        grid-template-columns: 1fr;
        max-width: 160px; // 单图保持小巧
        margin: 0 auto;
        
        .image-item {
          padding-bottom: 100%;
          width: 100%;
          max-width: 160px;
          margin: 0 auto;
        }
      }

      &.two {
        grid-template-columns: repeat(2, 1fr);
        max-width: 240px; // 两张图也保持较小
        margin: 0 auto;
      }

      &.three {
        grid-template-columns: repeat(3, 1fr);
        max-width: 320px; // 三张图稍微大一点
      }

      &.four {
        grid-template-columns: repeat(2, 1fr);
        max-width: 320px; // 四张图也适当增大
        margin: 0 auto;
      }

      &.five,
      &.six {
        grid-template-columns: repeat(3, 1fr);
        max-width: 360px; // 五六张图时展示区域最大
      }
    }
  }

  .report-section {
    margin: 12px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;

    .content-box {
      position: relative;
      width: 100%;
      overflow: hidden;

      .content {
        font-size: 14px;
        line-height: 1.8;
        color: #333;
        white-space: pre-wrap;
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