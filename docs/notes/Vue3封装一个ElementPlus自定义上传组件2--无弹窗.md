# Vue3封装一个ElementPlus自定义上传组件2--无弹窗

> **写在前面：** 无弹窗的上传组件它来了，依旧是小巧又好用，只不过这回我用的是前端直传的方式，采用http-request进行文件上传，中间有一些小坑，但幸运的是全都解决啦，组件很简单，但是用来学习是最好不过了，个人感觉我的注释应该也是浅显易懂的，希望大家在查看的同时不要忘了给我点个赞哦🥰，当然，如果有写的不恰当或者写的不对的地方，也欢迎大家在底下评论🎊

## 展示效果：
上传前：
![上传前效果图](/notes/element-upload-before.png)

上传后：
![上传后效果图](/notes/element-upload-after.png)

## 代码展示：
1. 首先就是定义一个ElementPlus的上传组件，我这边就叫NewUpload：
```html
<el-upload
    ref="upload"
    multiple
    :limit="limit"
    action="#"
    v-model:file-list="fileList"
    :before-upload="beforeUpload"
    :on-exceed="handleExceed"
    :on-success="handleUploadSuccess"
    :on-error="handleUploadError"
    :on-remove="handleDelete"
    :on-preview="handlePreview"
    :http-request="handleRequest"
>
  <el-button type="primary">上传</el-button>
  <template #tip>
    <div class="el-upload__tip">
      注意：请上传{{ fileSize }}m以下文件，最多支持上传文件数量：{{ limit }}个！
    </div>
  </template>
</el-upload>
<!--  如果是图片类型的直接预览，如果是其他类型，则自行添加方法处理 -->
<el-dialog v-model="dialogVisible">
  <img :src="dialogImageUrl" alt="Preview Image"/>
</el-dialog>
```

2. 定义js事件处理,里面注释都有，就不说明了
```javascript
import {ElMessage} from "element-plus";
import axios from "axios";

const props = defineProps({
  //文件列表
  modelValue: {
    type: Array,
    default: () => []
  },
  limit: {
    type: Number,
    default: 5
  },
  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 2,
  },
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: {
    type: Array,
    default: () => [".jpg", ".jpeg", ".png", ".doc", ".xls", ".xlsx", ".ppt", ".txt", ".pdf"],
  },
  // 是否显示提示框
  isShowTip: {
    type: Boolean,
    default: true
  },
})
const emit = defineEmits(['update:modelValue']);

//文件ref
const upload = ref()

//文件列表
const fileList = ref([]);

//单文件的参数--这边我定义成全局的，但是需要注意深浅拷贝的问题
const fileData = {
  name: "",
  url: "",
}

//文件url列表--为了解决ElementPlus的文件属性和我们定义上传的文件属性不一致的问题
let fileUrls = []

//初始化
onMounted(() => {
  if (props.modelValue.length > 0) {
    fileUrls = props.modelValue;
    fileList.value = fileUrls
  }
});

//处理事件
const beforeUpload = async (options) => {
  //校验文件类型
  if (props.fileType) {
    let fileExtension = "";
    if (options.name.lastIndexOf(".") > -1) {
      fileExtension = options.name.substring(options.name.lastIndexOf("."));
    }
    const isTypeOk = props.fileType.some(type => {
      if (options.type.indexOf(type) > -1) return true;
      return !!(fileExtension && fileExtension.indexOf(type) > -1);
    });
    if (!isTypeOk) {
      ElMessage.error(`文件格式不正确,请上传${props.fileType.join("/")}格式文件！`)
      return false;
    }
  }
  try {
    //准备上传的数据--这边我是使用前端直传的方式，所以第一步是获取预上传的Url信息
    const {name, url} = await preUpload({fileName: options.name});
    fileData.name = name;
    fileData.url = url;
    fileUrls.push(JSON.parse(JSON.stringify(toRaw(fileData))))
    fileList.value = fileUrls
  } catch (err) {
    ElMessage.error("获取上传地址失败，请稍后再试！");
    return false;
  }
}

//正式上传
const handleRequest = async ({file, onSuccess, onError}) => {
  try {
    const config = {
      //控制文件类型，方便进行显示还是下载
      headers: {
        "Content-Type": file.type,
      },
    };
    let newFile = new File([file], fileData.name, {type: file.type});
    //这边使用的是minio,用的是put方法,如果是自定义的上传方式，请使用对应的方法
    const response = await axios.put(fileData.url, newFile, config);
    //minio回调会有个status，具体还得看服务器回调
    if (response.status === 200) {
      //更新文件列表
      //ElementPlus的文件hub属性和我们定义上传的文件属性不一致，所以需要手动更新
      //所以这边我直接选择添加一个新的Url属性
      fileList.value.forEach((item, index) => {
        if (item.name === fileData.name) {
          fileList.value[index] = {
            ...fileList.value[index],
            newURL: getUrl(fileData.url)
          }
        }
      })
      onSuccess(response, file);
      //通知父组件，更新v-model
      emit('update:modelValue', fileList.value)
    } else {
      onError(response);
    }
  } catch (error) {
    onError(error);
  }
};

//minio的回调url会有多余的数据，这边处理了一下
const getUrl = (originalUrl) => {
  const url = new URL(originalUrl);
  return url.origin + url.pathname;
};

//处理删除
const handleDelete = (index) => {
  //这边两个列表都需要删除，以免出现数据不一致的情况
  fileList.value.slice(index, 1)
  fileUrls.splice(index, 1)
  emit('update:modelValue', fileList.value)
}

const handleExceed = () => {
  ElMessage.error(`只允许上传${props.limit}个文件`)
}

const handleUploadError = (err) => {
  ElMessage.error("上传失败，请重试");
}

//上传成功的回调，我们这里不需要处理
const handleUploadSuccess = (file) => {
}

const dialogVisible = ref(false);
const dialogImageUrl = ref("");
//弹出框进行文件预览
const handlePreview = (file) => {
  const isImage = checkImageType(file.url);
  if (isImage) {
    if (file.newURL) {
      dialogImageUrl.value = file.newURL;
      dialogVisible.value = true;
    }
  }
};

//校验文件类型
const checkImageType = (urlString) => {
  // 定义有效的图片扩展名
  const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];

  // 获取 URL 的后缀
  const url = new URL(urlString);
  const pathname = url.pathname;
  const extension = pathname.slice((Math.max(0, pathname.lastIndexOf(".")) || Infinity) + 1).toLowerCase();

  return validImageExtensions.includes(`.${extension}`);
};
```

## 调用方式：
>调用就超级简单啦

在随便哪个父组件的template中：
```html
<NewUpload v-model="uploadList" />
```
然后是js中定义uploadList
```javascript
const uploadList = ref([]);
```
---到此完成---

## 全部代码：
```javascript
<template>
  <el-upload
      ref="upload"
      multiple
      :limit="limit"
      action="#"
      v-model:file-list="fileList"
      :before-upload="beforeUpload"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :on-remove="handleDelete"
      :on-preview="handlePreview"
      :http-request="handleRequest"
  >
    <el-button type="primary">上传</el-button>
    <template #tip>
      <div class="el-upload__tip">
        注意：请上传{{ fileSize }}m以下文件，最多支持上传文件数量：{{ limit }}个！
      </div>
    </template>
  </el-upload>

  <!--  如果是图片类型的直接预览，如果是其他类型，则下载 -->
  <el-dialog v-model="dialogVisible">
    <img :src="dialogImageUrl" alt="Preview Image"/>
  </el-dialog>
</template>

<script setup>
import {ElMessage} from "element-plus";
import axios from "axios";

const props = defineProps({
  //文件列表
  modelValue: {
    type: Array,
    default: () => []
  },
  limit: {
    type: Number,
    default: 5
  },
  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 2,
  },
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: {
    type: Array,
    default: () => [".jpg", ".jpeg", ".png", ".doc", ".xls", ".xlsx", ".ppt", ".txt", ".pdf"],
  },
  // 是否显示提示框
  isShowTip: {
    type: Boolean,
    default: true
  },
})
const emit = defineEmits(['update:modelValue']);

//文件ref
const upload = ref()

//文件列表
const fileList = ref([]);

//单文件的参数--这边我定义成全局的，但是需要注意深浅拷贝的问题
const fileData = {
  name: "",
  url: "",
}

//文件url列表--为了解决ElementPlus的文件属性和我们定义上传的文件属性不一致的问题
let fileUrls = []

//初始化
onMounted(() => {
  if (props.modelValue.length > 0) {
    fileUrls = props.modelValue;
    fileList.value = fileUrls
  }
});

//处理事件
const beforeUpload = async (options) => {
  //校验文件类型
  if (props.fileType) {
    let fileExtension = "";
    if (options.name.lastIndexOf(".") > -1) {
      fileExtension = options.name.substring(options.name.lastIndexOf("."));
    }
    const isTypeOk = props.fileType.some(type => {
      if (options.type.indexOf(type) > -1) return true;
      return !!(fileExtension && fileExtension.indexOf(type) > -1);
    });
    if (!isTypeOk) {
      ElMessage.error(`文件格式不正确,请上传${props.fileType.join("/")}格式文件！`)
      return false;
    }
  }
  try {
    //准备上传的数据--这边我是使用前端直传的方式，所以第一步是获取预上传的Url信息
    const {name, url} = await preUpload({fileName: options.name});
    fileData.name = name;
    fileData.url = url;
    fileUrls.push(JSON.parse(JSON.stringify(toRaw(fileData))))
    fileList.value = fileUrls
  } catch (err) {
    ElMessage.error("获取上传地址失败，请稍后再试！");
    return false;
  }
}

//正式上传
const handleRequest = async ({file, onSuccess, onError}) => {
  try {
    const config = {
      //控制文件类型，方便进行显示还是下载
      headers: {
        "Content-Type": file.type,
      },
    };
    let newFile = new File([file], fileData.name, {type: file.type});
    //这边使用的是minio,用的是put方法,如果是自定义的上传方式，请使用对应的方法
    const response = await axios.put(fileData.url, newFile, config);
    //minio回调会有个status，具体还得看服务器回调
    if (response.status === 200) {
      //更新文件列表
      //ElementPlus的文件hub属性和我们定义上传的文件属性不一致，所以需要手动更新
      //所以这边我直接选择添加一个新的Url属性
      fileList.value.forEach((item, index) => {
        if (item.name === fileData.name) {
          fileList.value[index] = {
            ...fileList.value[index],
            newURL: getUrl(fileData.url)
          }
        }
      })
      onSuccess(response, file);
      //通知父组件，更新v-model
      emit('update:modelValue', fileList.value)
    } else {
      onError(response);
    }
  } catch (error) {
    onError(error);
  }
};

//minio的回调url会有多余的数据，这边处理了一下
const getUrl = (originalUrl) => {
  const url = new URL(originalUrl);
  return url.origin + url.pathname;
};

//处理删除
const handleDelete = (index) => {
  //这边两个列表都需要删除，以免出现数据不一致的情况
  fileList.value.slice(index, 1)
  fileUrls.splice(index, 1)
  emit('update:modelValue', fileList.value)
}

const handleExceed = () => {
  ElMessage.error(`只允许上传${props.limit}个文件`)
}

const handleUploadError = (err) => {
  ElMessage.error("上传失败，请重试");
}

//上传成功的回调，我们这里不需要处理
const handleUploadSuccess = (file) => {
}

const dialogVisible = ref(false);
const dialogImageUrl = ref("");
//弹出框进行文件预览
const handlePreview = (file) => {
  const isImage = checkImageType(file.url);
  if (isImage) {
    if (file.newURL) {
      dialogImageUrl.value = file.newURL;
      dialogVisible.value = true;
    }
  }
};

//校验文件类型
const checkImageType = (urlString) => {
  // 定义有效的图片扩展名
  const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];

  // 获取 URL 的后缀
  const url = new URL(urlString);
  const pathname = url.pathname;
  const extension = pathname.slice((Math.max(0, pathname.lastIndexOf(".")) || Infinity) + 1).toLowerCase();

  return validImageExtensions.includes(`.${extension}`);
};

</script>
``` 