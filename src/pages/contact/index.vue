<template>
  <view class="contact-container">
    <view class="content-section">
      <view class="contact-card">
        <view class="card-title">
          <IconFont name="service" size="20" color="#1296db" />
          <text class="title-text">客服微信</text>
        </view>
        
        <view class="wechat-info">
          <view class="wechat-id">
            <text class="label">微信号：</text>
            <text class="value">19210091735</text>
            <view class="copy-btn" @tap="copyWechatId">复制</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { IconFont } from "@nutui/icons-vue-taro"
import Taro from '@tarojs/taro'
import {onMounted} from "vue";

// 复制微信号到剪贴板
const copyWechatId = () => {
  Taro.setClipboardData({
    data: '19210091735',
    success: function() {
      Taro.showToast({
        title: '微信号已复制',
        icon: 'success'
      })
    }
  })
}

onMounted(() =>{
  Taro.setNavigationBarTitle({
    title: '联系客服'
  })
})
</script>

<style lang="scss">
.contact-container {
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
  
  .content-section {
    padding: 16px;
    
    .contact-card {
      background-color: #fff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      
      .card-title {
        display: flex;
        align-items: center;
        margin-bottom: 24px;
        
        .title-text {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-left: 8px;
        }
      }
      
      .wechat-info {
        background-color: #f8fafd;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        
        .wechat-id {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          
          .label {
            font-size: 14px;
            color: #666;
          }
          
          .value {
            font-size: 14px;
            color: #333;
            font-weight: 500;
            flex: 1;
          }
          
          .copy-btn {
            background-color: #1296db;
            color: #fff;
            font-size: 12px;
            padding: 4px 12px;
            border-radius: 12px;
            
            &:active {
              opacity: 0.8;
            }
          }
        }
        
        .qr-code-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .qr-code {
            width: 160px;
            height: 160px;
            background-color: #fff;
            padding: 8px;
            border-radius: 8px;
            margin-bottom: 8px;
          }
          
          .qr-tip {
            font-size: 12px;
            color: #999;
          }
        }
      }
      
      .service-time {
        display: flex;
        align-items: center;
        
        .time-label {
          font-size: 14px;
          color: #666;
        }
        
        .time-value {
          font-size: 14px;
          color: #333;
        }
      }
    }
  }
}
</style> 