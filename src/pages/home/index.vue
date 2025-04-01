<template>
  <view class="container">
    <view class="home-container">
      <view class="header-section">
        <text class="title">Ai鉴宝</text>
      </view>

      <view class="content-section">
        <view class="upload-section">
          <view class="section-block tips-block">
            <view class="block-title">建议</view>
            <view class="tip-list">
              <view class="tip-item">请尽可能多的拍摄物品的不同角度（整体器形、底部、口沿、器内、微观特征）</view>
              <view class="tip-item">确保光线充足，画面清晰，背景简洁，突出主体</view>
              <view class="tip-item">鉴定结果请到<text class="link-text" @tap="goToHistory">鉴定记录</text>中查看</view>
            </view>
          </view>
          
          <view class="section-block upload-block">
            <view class="block-title">上传图片</view>
            <view class="upload-content">
              <view class="upload-grid">
                <!-- 整体器形-正面 -->
                <view class="upload-item">
                  <view class="upload-item-title">
                    <text class="required">*</text>
                    整体正面
                  </view>
                  <view class="image-container">
                    <view v-if="imageMap.front" class="image-preview">
                      <image :src="imageMap.front.url" mode="aspectFill" class="preview-image" />
                      <view class="delete-icon" @tap="onDelete('front')">
                        <IconFont name="close" size="12" color="#fff" />
                      </view>
                    </view>
                    <view v-else class="upload-box" @tap="handleUpload('front')">
                      <view class="upload-hint">点击上传</view>
                    </view>
                  </view>
                </view>

                <!-- 整体器形-反面 -->
                <view class="upload-item">
                  <view class="upload-item-title">
                    <text class="required">*</text>
                    整体反面
                  </view>
                  <view class="image-container">
                    <view v-if="imageMap.back" class="image-preview">
                      <image :src="imageMap.back.url" mode="aspectFill" class="preview-image" />
                      <view class="delete-icon" @tap="onDelete('back')">
                        <IconFont name="close" size="12" color="#fff" />
                      </view>
                    </view>
                    <view v-else class="upload-box" @tap="handleUpload('back')">
                      <view class="upload-hint">点击上传</view>
                    </view>
                  </view>
                </view>

                <!-- 底部 -->
                <view class="upload-item">
                  <view class="upload-item-title">
                    <text class="required">*</text>
                    底部
                  </view>
                  <view class="image-container">
                    <view v-if="imageMap.bottom" class="image-preview">
                      <image :src="imageMap.bottom.url" mode="aspectFill" class="preview-image" />
                      <view class="delete-icon" @tap="onDelete('bottom')">
                        <IconFont name="close" size="12" color="#fff" />
                      </view>
                    </view>
                    <view v-else class="upload-box" @tap="handleUpload('bottom')">
                      <view class="upload-hint">点击上传</view>
                    </view>
                  </view>
                </view>

                <!-- 口沿 -->
                <view class="upload-item">
                  <view class="upload-item-title">
                    <text class="required">*</text>
                    口沿
                  </view>
                  <view class="image-container">
                    <view v-if="imageMap.rim" class="image-preview">
                      <image :src="imageMap.rim.url" mode="aspectFill" class="preview-image" />
                      <view class="delete-icon" @tap="onDelete('rim')">
                        <IconFont name="close" size="12" color="#fff" />
                      </view>
                    </view>
                    <view v-else class="upload-box" @tap="handleUpload('rim')">
                      <view class="upload-hint">点击上传</view>
                    </view>
                  </view>
                </view>

                <!-- 器内 -->
                <view class="upload-item">
                  <view class="upload-item-title">
                    <text class="required">*</text>
                    器内
                  </view>
                  <view class="image-container">
                    <view v-if="imageMap.inside" class="image-preview">
                      <image :src="imageMap.inside.url" mode="aspectFill" class="preview-image" />
                      <view class="delete-icon" @tap="onDelete('inside')">
                        <IconFont name="close" size="12" color="#fff" />
                      </view>
                    </view>
                    <view v-else class="upload-box" @tap="handleUpload('inside')">
                      <view class="upload-hint">点击上传</view>
                    </view>
                  </view>
                </view>

                <!-- 微观特征 -->
                <view class="upload-item">
                  <view class="upload-item-title">
                    微观特征
                  </view>
                  <view class="image-container">
                    <view v-if="imageMap.micro" class="image-preview">
                      <image :src="imageMap.micro.url" mode="aspectFill" class="preview-image" />
                      <view class="delete-icon" @tap="onDelete('micro')">
                        <IconFont name="close" size="12" color="#fff" />
                      </view>
                    </view>
                    <view v-else class="upload-box" @tap="handleUpload('micro')">
                      <view class="upload-hint">点击上传</view>
                    </view>
                  </view>
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
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'
import LoginPopup from '../../components/LoginPopup.vue'
import AuthPopup from '../../components/AuthPopup.vue'
import { IconFont } from "@nutui/icons-vue-taro"
import BASE_URL from "../../utils/request";

// 图片映射对象
const imageMap = ref({
  front: null,  // 整体器形-正面
  back: null,   // 整体器形-反面
  bottom: null, // 底部
  rim: null,    // 口沿
  inside: null, // 器内
  micro: null   // 微观特征
})

// 修改文件列表的获取方式
const fileList = computed(() => {
  return Object.values(imageMap.value).filter(item => item !== null)
})

const isLoading = ref(false)
const showLoginPopup = ref(false)
const showAuthPopup = ref(false)

// 删除前的回调
const onBeforeDelete = (type: string) => {
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

// 删除图片回调
const onDelete = async (type: string) => {
  const result = await onBeforeDelete(type)
  if (result) {
    imageMap.value[type] = null
  }
}

// 修改上传组件的实现
const handleUpload = (type: string) => {
  Taro.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async function (res) {
      const tempFilePath = res.tempFilePaths[0]
      const tempFile = res.tempFiles[0]

      // 检查文件大小
      if (tempFile.size > 10 * 1024 * 1024) {
        onOversize()
        return
      }

      // 添加到对应的位置
      imageMap.value[type] = {
        url: tempFilePath,
        status: 'success',
        message: '上传成功',
        type: 'image'
      }

      // 预加载图片
      try {
        await Taro.getImageInfo({
          src: tempFilePath
        })
      } catch (error) {
        console.error('图片预加载失败', error)
      }
    }
  })
}

// 开始分析前的验证
const startAnalyze = async () => {
  if (isLoading.value) return

  // 检查必填图片是否都已上传
  const requiredTypes = ['front', 'back', 'bottom', 'rim', 'inside']
  const missingTypes = requiredTypes.filter(type => !imageMap.value[type])

  if (missingTypes.length > 0) {
    const typeNames = {
      front: '整体器形-正面',
      back: '整体器形-反面',
      bottom: '底部',
      rim: '口沿',
      inside: '器内'
    }
    const missingNames = missingTypes.map(type => typeNames[type]).join('、')
    Taro.showToast({
      title: `请上传${missingNames}的图片`,
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
    console.log('未登录，显示登录弹窗')
    showLoginPopup.value = true
  } else {
    // 已登录，检查授权状态
    const userInfo = Taro.getStorageSync('userInfo')
    console.log('已登录 检查授权')
    await checkAuthAndStartAnalyze(userInfo)
  }
}

// 检查授权状态并开始分析
const checkAuthAndStartAnalyze = async (userInfo) => {
  if (!userInfo || !userInfo.nickname || !userInfo.avatarUrl) {
    // 未授权，显示授权弹窗
    console.log('未授权，显示授权弹窗')
    showAuthPopup.value = true
  } else {
    // 已授权，开始分析
    console.log('已授权，进入分析')
    await startAnalyzeProcess()
  }
}

// 分析流程
const startAnalyzeProcess = async () => {
  isLoading.value = true
  try {
    // 构建 formData，只包含除第一张外的其他图片
    const formData = {}
    fileList.value.slice(1).forEach((file, index) => {
      formData[`file${index + 1}`] = file.url  // 从 file1 开始，因为 file0 通过 filePath 传递
    })

    console.log('准备上传的数据:', {
      file0: fileList.value[0].url,  // 第一张图片通过 filePath 上传
      ...formData  // 其他图片通过 formData 上传
    })
//
    const MultiPart = require('../../utils/Multipart.min.js')
    const fields = []
    const files = fileList.value.map(file => {
      return {
        name: `files`,
        filePath: file.url
      }
    })
    console.log('上传参数:', files)
    const res = await new MultiPart({
          fields,
          files
    }
    ).submit(`${BASE_URL}/minio/imageUpload`,{
      header:{
        'sessionId': Taro.getStorageSync('token')
      }
    })
    console.log('上传结果:', res)
    if (res.data.code === 200){
      console.log('上传成功')
      Taro.showToast({
        title: '正在分析中，鉴定结果请到鉴定列表中查找',
        icon: 'none'
      })
      imageMap.value = {}
    }else{
      throw new Error(`请求失败，状态码：${res.data.msg}`)
    }
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
const handleLoginResponse = (userInfo) => {
  console.log('登录成功,授权状态')
  showLoginPopup.value = false
  // 登录成功后，检查授权状态
  checkAuthAndStartAnalyze(userInfo)
}

// 处理登录弹窗关闭
const handleLoginClose = () => {
  console.log('登录弹窗关闭')
  showLoginPopup.value = false
}

// 处理授权确认
const handleAuthConfirm = (userInfo) => {
  showAuthPopup.value = false
  console.log('更新用户信息：', userInfo)
  // 授权成功后，开始分析
  startAnalyzeProcess()
}

// 处理授权弹窗关闭
const handleAuthClose = () => {
  showAuthPopup.value = false
}

// 跳转到鉴定记录页面
const goToHistory = () => {
  const token = Taro.getStorageSync('token')
  if (!token) {
    Taro.showToast({
      title: '请先登录',
      icon: 'none'
    })
    showLoginPopup.value = true
    return
  }

  Taro.navigateTo({
    url: '/pages/history/index'
  }).catch(err => {
    console.error('跳转鉴定记录页面失败', err)
    Taro.showToast({
      title: '跳转失败',
      icon: 'none'
    })
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

        .link-text {
          color: #1296db;
          text-decoration: none;
          
          &:active {
            opacity: 0.8;
          }
        }
      }
    }
  }

  .upload-block {
    .upload-content {
      .upload-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        padding: 0 12px;
      }

      .upload-item {
        .upload-item-title {
          font-size: 14px;
          color: #333;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;

          .required {
            color: #f56c6c;
            margin-right: 2px;
          }
        }

        .image-container {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-preview {
          width: 100%;
          height: 100%;
          position: relative;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;

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
          width: 100%;
          height: 100%;
          background-color: #f8fafd;
          border-right: 1px dashed #1296db;
          border-bottom: 1px dashed #1296db;
          border-radius: 0 0 8px 0;
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