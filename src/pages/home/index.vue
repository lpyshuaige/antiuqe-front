<template>
  <view class="container">
    <view class="home-container">
      <view class="header-section">
        <text class="title">古玩鉴别</text>
      </view>

      <view class="content-section">
        <view class="upload-section" v-if="current === 0">
          <view class="section-block tips-block">
            <view class="block-title">拍摄建议</view>
            <view class="tip-list">
              <view class="tip-item">请尽可能多的拍摄物品的不同角度（正面、底部、侧面等）</view>
              <view class="tip-item">确保光线充足，画面清晰，背景简洁</view>
            </view>
          </view>
          
          <view class="section-block upload-block">
            <view class="block-title">上传图片</view>
            <view class="upload-content">
              <view class="image-list">
                <view 
                  v-for="(file, index) in fileList" 
                  :key="index"
                  class="image-item"
                >
                  <image :src="file.url" mode="aspectFill" class="preview-image" />
                  <view class="delete-icon" @tap="onDelete(file, index)">
                    <IconFont name="close" size="12" color="#fff" />
                  </view>
                </view>
                <view 
                  class="upload-box"
                  v-if="fileList.length < 6"
                  @tap="handleUpload"
                >
                  <view class="upload-hint">点击上传</view>
                  <view class="upload-desc">最多6张照片</view>
                </view>
              </view>
            </view>
          </view>

          <view class="button-block">
            <nut-button type="primary" class="analyze-btn" @tap="startAnalyze" :loading="isLoading">
              开始分析
            </nut-button>
          </view>
        </view>

        <view class="analysis-section" v-if="current === 1">
          <view class="loading-text">AI正在分析中...</view>
        </view>

        <view class="result-section" v-if="current === 2">
          <view class="preview-result">
            <view class="result-title">初步分析结果</view>
            <view class="result-content">
              {{ previewResult }}
            </view>
          </view>

          <view class="unlock-section">
            <view class="unlock-title">解锁完整报告</view>
            <view class="unlock-price">￥9.9</view>
            <nut-button type="primary" class="unlock-btn" @click="handleUnlock">
              立即解锁
            </nut-button>
          </view>
        </view>
      </view>
    </view>

    <LoginPopup 
      :show="showLoginPopup" 
      @login="handleLoginResponse" 
      @close="handleLoginClose">
    </LoginPopup>
    <AuthPopup 
      :show="showAuthPopup" 
      @confirm="handleAuthConfirm" 
      @close="handleAuthClose">
    </AuthPopup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import LoginPopup from '../../components/LoginPopup.vue'
import AuthPopup from '../../components/AuthPopup.vue'
import { IconFont } from "@nutui/icons-vue-taro"

const current = ref(0)
const fileList = ref([])
const previewResult = ref('这件古玩疑似为清代青花瓷器，具体年代和真伪需要进一步解锁完整报告查看...')
const isLoading = ref(false)
const showLoginPopup = ref(false)
const showAuthPopup = ref(false)

// 删除前的回调
const onBeforeDelete = (file: any) => {
  return new Promise((resolve) => {
    Taro.showModal({
      title: '提示',
      content: '确定删除该图片吗？',
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

// 文件大小超限提示
const onOversize = () => {
  Taro.showToast({
    title: '图片大小不能超过10MB',
    icon: 'none'
  })
}

// 上传成功回调
const onSuccess = (response: any, file: any) => {
  console.log('上传成功', response, file)
}

// 修改上传组件的实现
const handleUpload = () => {
  Taro.chooseImage({
    count: 6 - fileList.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async function (res) {
      // 选择图片成功
      const tempFilePaths = res.tempFilePaths
      const tempFiles = res.tempFiles

      // 检查文件大小
      const oversizeFiles = tempFiles.filter(file => file.size > 10 * 1024 * 1024)
      if (oversizeFiles.length > 0) {
        onOversize()
        return
      }

      // 添加到文件列表
      const newFiles = tempFilePaths.map(path => ({
        url: path,
        status: 'success',
        message: '上传成功',
        type: 'image'
      }))
      fileList.value = [...fileList.value, ...newFiles]

      // 预加载图片以确保可以显示
      for (const file of newFiles) {
        try {
          await Taro.getImageInfo({
            src: file.url
          })
        } catch (error) {
          console.error('图片预加载失败', error)
        }
      }
    }
  })
}

// 删除图片回调
const onDelete = async (file: any, index: number) => {
  const result = await onBeforeDelete(file)
  if (result) {
    fileList.value = fileList.value.filter((_, i) => i !== index)
  }
}

const startAnalyze = async () => {
  if (isLoading.value) return  // 如果正在加载中，直接返回
  if (fileList.value.length === 0) {
    Taro.showToast({
      title: '请先上传图片',
      icon: 'none'
    })
    return
  }

  // 检查登录状态并开始流程
  await checkLoginStatus()
}

// 检查登录状态
const checkLoginStatus = async () => {
  const token = Taro.getStorageSync('token')
  if (!token) {
    // 未登录，显示登录弹窗
    showLoginPopup.value = true
  } else {
    // 已登录，检查授权状态
    await checkAuthAndStartAnalyze()
  }
}

// 检查授权状态并开始分析
const checkAuthAndStartAnalyze = async () => {
  const userInfo = Taro.getStorageSync('userInfo')
  if (!userInfo || !userInfo.avatarUrl || !userInfo.nickName) {
    // 未授权，显示授权弹窗
    showAuthPopup.value = true
  } else {
    // 已授权，开始分析
    await startAnalyzeProcess()
  }
}

// 分析流程
const startAnalyzeProcess = async () => {
  isLoading.value = true
  try {
    // 准备上传的图片数据
    const images = fileList.value.map(file => file.url)

    // 模拟调用后端分析接口
    const response = await new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 0,
          data: {
            canViewFullReport: false, // 是否可以查看完整报告
            basicInfo: {
              category: '青花瓷器',
              age: '清代',
              material: '瓷器'
            },
            detailInfo: null // 非会员返回null
          }
        })
      }, 2000)
    })

    // 跳转到结果页面
    Taro.navigateTo({
      url: `/pages/result/index?imageList=${encodeURIComponent(JSON.stringify(images))}&canViewFullReport=${response.data.canViewFullReport}&basicInfo=${encodeURIComponent(JSON.stringify(response.data.basicInfo))}&detailInfo=${encodeURIComponent(JSON.stringify(response.data.detailInfo))}`
    })
  } catch (err) {
    console.error('操作失败', err)
    Taro.showToast({
      title: '系统错误',
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// 处理登录响应
const handleLoginResponse = (isAuth: boolean) => {
  console.log('登录成功')
  showLoginPopup.value = false
  // 登录成功后，检查授权状态
  checkAuthAndStartAnalyze()
}

// 处理登录弹窗关闭
const handleLoginClose = () => {
  showLoginPopup.value = false
}

// 处理授权确认
const handleAuthConfirm = (userInfo) => {
  showAuthPopup.value = false
  Taro.setStorageSync('userInfo', userInfo)
  console.log('更新用户信息：', userInfo)
  // 授权成功后，开始分析
  startAnalyzeProcess()
}

// 处理授权弹窗关闭
const handleAuthClose = () => {
  showAuthPopup.value = false
}

const handleUnlock = () => {
  Taro.showModal({
    title: '支付确认',
    content: '是否确认支付￥9.9解锁完整报告？',
    success: function (res) {
      if (res.confirm) {
        // 调用支付接口
        Taro.requestPayment({
          timeStamp: '',
          nonceStr: '',
          package: '',
          signType: 'MD5',
          paySign: '',
          success: function () {
            Taro.showToast({
              title: '支付成功',
              icon: 'success'
            })
          },
          fail: function () {
            Taro.showToast({
              title: '支付失败',
              icon: 'error'
            })
          }
        })
      }
    }
  })
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 32px;
}

.home-container {
  padding: 16px;

  .header-section {
    background-color: #fff;
    padding: 32px 16px;
    border-radius: 12px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    text-align: center;

    .title {
      font-size: 28px;
      font-weight: bold;
      color: #333;
      letter-spacing: 2px;
    }
  }

  .content-section {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    padding: 0 16px;
  }

  .section-block {
    padding: 24px 0;
    background-color: #fff;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .block-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 24px;
      padding-left: 12px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background-color: #1296db;
        border-radius: 2px;
      }
    }
  }

  .tips-block {
    .tip-list {
      padding: 20px;
      background-color: #f8fafd;
      border-radius: 8px;
      border: 1px solid rgba(18, 150, 219, 0.1);

      .tip-item {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;

        &:last-child {
          margin-bottom: 0;
        }

        &::before {
          content: '•';
          margin-right: 8px;
          color: #1296db;
        }
      }
    }
  }

  .upload-block {
    .upload-content {
      .image-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        
        .image-item {
          width: 100px;
          height: 100px;
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #eee;

          .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .delete-icon {
            position: absolute;
            right: -6px;
            top: -6px;
            width: 20px;
            height: 20px;
            background-color: rgba(0, 0, 0, 0.7);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translate(-50%, 50%);
            z-index: 2;
          }
        }

        .upload-box {
          width: 100px;
          height: 100px;
          background-color: #f8fafd;
          border: 1px dashed #1296db;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;

          &:active {
            background-color: #eef5ff;
          }

          .upload-hint {
            font-size: 14px;
            color: #1296db;
            margin-bottom: 4px;
          }

          .upload-desc {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
  }
}

/* NutUI 组件样式覆盖 */
.nut-uploader__preview {
  margin: 0 10px 10px 0 !important;
  border-radius: 8px !important;
  overflow: visible !important;
  border: 1px solid #eee !important;
  position: relative !important;
}

.nut-uploader__preview-img {
  border-radius: 8px !important;
  width: 100px !important;
  height: 100px !important;
}

.nut-uploader__preview-delete {
  transform: translate(50%, -50%) !important;
  right: -6px !important;
  top: -6px !important;
  width: 20px !important;
  height: 20px !important;
  background-color: rgba(0, 0, 0, 0.7) !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 2 !important;
}

.nut-uploader__preview-delete::before,
.nut-uploader__preview-delete::after {
  background-color: #fff !important;
  height: 12px !important;
  width: 2px !important;
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  .section-block {
    width: 100%;
  }
}

.button-block {
  padding: 24px 0 32px;
  width: 100%;
  display: flex;
  justify-content: center;

  .analyze-btn {
    width: 200px;
    height: 44px;
    font-size: 16px;
    border-radius: 22px;
    box-shadow: 0 4px 12px rgba(18, 150, 219, 0.2);

    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 6px rgba(18, 150, 219, 0.2);
    }
  }
}

.analysis-section {
  padding: 48px 16px;
  text-align: center;

  .loading-text {
    color: #666;
    font-size: 15px;
  }
}

.result-section {
  padding: 24px 16px;

  .preview-result {
    padding: 20px;
    background-color: #f8fafd;
    border-radius: 12px;
    margin-bottom: 24px;
    border: 1px solid rgba(18, 150, 219, 0.1);

    .result-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 16px;
    }

    .result-content {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
    }
  }

  .unlock-section {
    text-align: center;
    padding: 28px 16px;
    background-color: #f8fafd;
    border-radius: 12px;
    border: 1px solid rgba(18, 150, 219, 0.1);

    .unlock-title {
      font-size: 16px;
      color: #333;
      margin-bottom: 12px;
    }

    .unlock-price {
      font-size: 32px;
      color: #f56c6c;
      font-weight: bold;
      margin-bottom: 24px;
    }

    .unlock-btn {
      width: 240px;
      height: 44px;
      font-size: 16px;
      border-radius: 22px;
      box-shadow: 0 4px 12px rgba(245, 108, 108, 0.2);

      &:active {
        transform: translateY(1px);
        box-shadow: 0 2px 6px rgba(245, 108, 108, 0.2);
      }
    }
  }
}
</style> 