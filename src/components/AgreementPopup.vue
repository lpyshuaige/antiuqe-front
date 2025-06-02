<template>
  <nut-popup
    v-model:visible="popupVisible"
    position="center"
    :style="{ width: '80%', borderRadius: '12px', maxHeight: '90vh' }"
    @close="handleClose"
    @overlay-click="handleOverlayClick"
  >
    <view class="agreement-popup-container">
      <view class="agreement-header">
        <text class="agreement-title">古玩AI鉴定服务协议</text>
      </view>
      
      <view class="agreement-scroll-container">
        <scroll-view 
          scroll-y="true" 
          :style="{ height: '50vh' }"
          :enhanced="true"
          :show-scrollbar="true"
          :bounces="true"
          :scroll-with-animation="true"
          class="agreement-content"
        >
          <view class="agreement-notice">
            <view class="notice-text">(用户点击我已知晓后方可使用服务)</view>
          </view>
          
          <view class="agreement-item">
            <view class="item-title">第一条 服务性质声明</view>
            <view class="item-text">1.1 本平台提供的AI鉴定结果基于算法模型对用户提交数据(图文/视频等)的分析，属于技术性意见，非专业机构鉴定结论，更不构成法律认可的文物鉴定报告。</view>
            <view class="item-text">1.2 用户理解并同意:AI鉴定存在误差可能，平台不保证鉴定结果100%准确，鉴定结果不得作为交易投资、保险、司法等活动的依据。</view>
          </view>
          
          <view class="agreement-item">
            <view class="item-title">第二条 用户权利义务</view>
            <view class="item-text">2.1 用户保证:</view>
            <view class="item-text">·提交物品为合法持有，不涉及赃物、走私品等非法物品</view>
            <view class="item-text">·提供的信息真实、完整、无误导性</view>
            <view class="item-text">·自行承担物品运输/上传过程中的风险</view>
            <view class="item-text">2.2 用户知晓:</view>
            <view class="item-text">·不得提交枪支、危险品等违禁物品</view>
            <view class="item-text">·不得利用鉴定结果从事欺诈、虚假宣传等违法活动</view>
          </view>
          
          <view class="agreement-item">
            <view class="item-title">第三条 责任限制条款</view>
            <view class="item-text">3.1 平台不对以下情形承担责任:</view>
            <view class="item-text">·因用户提供信息不完整/不清晰导致的鉴定偏差</view>
            <view class="item-text">·物品因材质、拍摄条件等导致的AI误判</view>
            <view class="item-text">·用户基于鉴定结果做出的任何经济决策损失</view>
            <view class="item-text">·不可抗力或第三方原因导致的服务中断</view>
            <view class="item-text">3.2 平台赔偿上限不超过当次服务费用的3倍</view>
          </view>
          
          <view class="agreement-item">
            <view class="item-title">第四条 知识产权与数据授权</view>
            <view class="item-text">4.1 用户上传内容(图文/视频等)的著作权仍归用户所有，但用户授予平台全球范围内免费的、不可撤销的使用权，用于算法训练及服务优化。</view>
            <view class="item-text">4.2 平台数据库、算法模型、界面设计等全部知识产权归平台所有。</view>
          </view>
          
          <view class="agreement-item">
            <view class="item-title">第五条 特殊风险提示</view>
            <view class="item-text">5.1 用户理解古玩鉴定的复杂性，特别是</view>
            <view class="item-text">·高仿品可能被误判为真品</view>
            <view class="item-text">·碳十四等科学检测手段无法通过AI实现</view>
            <view class="item-text">·品相、包浆等要素可能存在识别误差</view>
            <view class="item-text">·用户使用完该鉴定服务，平台出具结果视为鉴定服务完成，若因对鉴定结果不认同或者存在异议，平台将无法退还鉴定服务费</view>
          </view>
          
          <view class="agreement-item">
            <view class="item-title">第六条 法律适用与争议解决</view>
            <view class="item-text">6.1 本协议受中华人民共和国法律管辖</view>
            <view class="item-text">6.2 争议应首先通过协商解决，协商不成提交平台所在地有管辖权法院诉讼</view>
          </view>
          
          <view class="agreement-item">
            <view class="item-title">第七条 其他条款</view>
            <view class="item-text">7.1 平台保留修改本协议的权利，修改后继续使用视为接受</view>
            <view class="item-text">7.2 若部分条款无效，不影响其他条款效力</view>
          </view>
          
          <view class="agreement-item">
            <view class="item-text">AI鉴定结果仅供参考，平台不承担任何直接、间接附带或惩罚性赔偿责任。用户如需法律效力的鉴定应前往国家认可的文物鉴定机构。</view>
          </view>
          
          <view class="agreement-bottom-space"></view>
        </scroll-view>
      </view>
      
      <view class="agreement-footer">
        <view class="confirm-button" @click="handleConfirm">我已知晓</view>
      </view>
    </view>
  </nut-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Taro from '@tarojs/taro'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'confirm'])

const popupVisible = ref(false)

// 监听父组件传入的show属性变化
watch(() => props.show, (newValue) => {
  popupVisible.value = newValue
})

// 监听popupVisible变化，同步回父组件
watch(() => popupVisible.value, (newValue) => {
  if (!newValue) {
    emit('update:show', false)
  }
})

// 当点击"我已知晓"按钮时调用
const handleConfirm = () => {
  // 存储协议版本到本地
  Taro.setStorageSync('agreement-ver', 'v1')
  emit('confirm')
  popupVisible.value = false
}

// 处理关闭事件
const handleClose = () => {
  // 不改变本地存储状态，只关闭弹窗
  popupVisible.value = false
}

// 处理点击蒙层事件
const handleOverlayClick = () => {
  // 允许点击蒙层关闭弹窗
  popupVisible.value = false
}

</script>

<style lang="scss">
.agreement-popup-container {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.agreement-header {
  padding: 16px;
  text-align: center;
  
  .agreement-title {
    font-size: 18px;
    font-weight: 500;
    color: #333;
  }
}

.agreement-scroll-container {
  width: 100%;
  position: relative;
  padding-bottom: 10px;
}

.agreement-content {
  width: 100%;
  height: 50vh;
  padding: 0;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  
  .agreement-notice {
    margin-bottom: 16px;
    padding: 0 16px;
    text-align: center;
    
    .notice-text {
      font-size: 14px;
      color: #999;
      font-style: italic;
    }
  }
  
  .agreement-item {
    margin-bottom: 16px;
    padding: 0 16px;
    
    &:last-child {
      margin-bottom: 16px;
    }
    
    .item-title {
      font-size: 15px;
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
    }
    
    .item-text {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      text-align: left;
      margin-bottom: 6px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .agreement-bottom-space {
    height: 30px; /* 添加底部空间确保最后的内容可见 */
  }
}

.agreement-footer {
  padding: 16px;
  display: flex;
  justify-content: center;
  
  .confirm-button {
    background-color: #ec350c;
    color: #fff;
    padding: 10px 30px;
    border-radius: 20px;
    font-size: 16px;
    text-align: center;
    
    &:active {
      opacity: 0.9;
    }
  }
}

::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 10px;
}

scroll-view ::-webkit-scrollbar-thumb {
  background-color: #c0c0c0 !important;
}
</style> 