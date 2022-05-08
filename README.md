# 安装：
> npm i vue-dialog-yy

# 引入
```js main.js
import Vue from 'vue'
import Dialog from 'vue-dialog-yy'

Vue.use(Dialog, {
  // 务必传入store和router，否则Dialog内组件用到时会报错，因为不共享同一个Vue实例
  store,
  router,
  // 如果需要注册为组件，声明registerComponent并定义组件名
  registerComponent: 'CustomDialog'
})
```

# 使用示例：
```javascript
this.$dialog(
  // Dialog标题
  'title',
  // 引入的组件模块、显示的内容
  import('components/dialog/testValidate'),
  // Dialog的配置项
  {
    // minimizable为true时需要指定唯一id
    id: 'testValidate', 
    // 最小化时如果有设置id，不会执行then和beforeClose的方法，只会执行onMinimized()
    minimizable: true,
    maximizable: true,
    // 使用方法调用Dialog时必须设置appendToBody为true，(默认为true)，否则不会弹出
    appendToBody: true, 
    // 使用方法调用Dialog时必须设置inline为false，(默认为false)，否则不会弹出
    inline: false,
    // 是否显示默认取消按钮
    showCancelButton: false,
    // 默认取消按钮文字
    cancelButtonText: '取消',
    // 是否显示默认确认按钮
    showConfirmButton: false,
    // 默认确认按钮文字
    confirmButtonText: '确认',
    // 自定义Dialogclass
    customClass: 'custom',
    // 自定义按钮
    customButtons: [
      {
        text: '立即创建',
        type: 'primary',
        loading: false,
        click: (child, done, button) => {
          button.loading = true
          // 调用子组件的方法
          child.resetForm()
          button.loading = false
          button.text = '完成'
        }
      }, {
        text: '充值',
        click: (child, done, button ) => {
          // 传入父组件的参数
          child.resetForm(this.data1)
        }
      }
    ],
    // Dialog打开时的钩子
    onOpen: child => {
      child.search()
    },
    // Dialog关闭前的钩子，可以控制Dialog是否要关闭
    onBeforeClose: (child, done, action) => {
      console.log(action)
      // 需要显示调用done()方法才会关闭Dialog, 方法可以传入任意参数，会做为then的action
      done()
    }
  },
  // 传入子组件的props，用on+小驼峰命名来区分事件和props
  {
    type: 'edit',
    // 子组件$emit('onSearch')触发
    onSearch: (data) => {
      console.log(data)
    }
  }
).then(action => {
  // Dialog关闭后的钩子
  console.log(action)
})
```

# Attributes
| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| id | 是否永久保存该Dialog实例，若有id则保存，默认不保存，需要整个项目唯一id | string、number | - | - |
| showCancelButton | 是否显示默认取消按钮 | boolean | - | true |
| cancelButtonText | 默认取消按钮文字 | string、number | - | '取消' |
| cancelButtonSize | 默认取消按钮大小 | string | medium / small / mini | 'small' |
| showConfirmButton | 是否显示默认确认按钮 | boolean | - | true |
| confirmButtonText | 默认确认按钮文字 | string、number | - | '确认' |
| confirmButtonSize | 默认确认按钮大小 | string | medium / small / mini | 'small' |
| customClass | 自定义Dialog类名，样式可以直接写在style/index.scss里 | string | - | - |
| customButtons | 自定义按钮，配置见使用示例 | Array | - | - |
| title | 标题文字, 不传即不显示头部 | string | - | '' |
| headerBackground | header背景, 可设置渐变 | string | - | '#e8f4ff' |
| footerBackground | footer背景, 可设置渐变 | string | - | '#fff' |
| icon | 标题旁边的图标样式名称 | string | element-ui的图标 | - |
| width | Dialog宽度 | string | - | auto |
| height | Dialog高度 | string | - | auto |
| headerHeight | 头部高度 | string | - | '40px' |
| footerHeight | 底部高度 | string | - | '40px' |
| closable | 是否显示关闭按钮 | boolean | - | true |
| maximizable | 是否显示最小化按钮 | boolean | - | false |
| maximizable | 是否显示最大化按钮 | boolean | - | false |
| closeOnClickModal | 是否可以通过点击 modal 关闭Dialog | boolean | - | true |
| closeOnPressEscape | 是否可以通过按下 ESC 关闭Dialog | boolean | - | true |
| modal | 是否显示遮罩层，inline为true是无效 | boolean | - | true |
| draggable | 是否支持Dialog拖拽 | boolean | - | true |
| resizable | 是否支持Dialog改变尺寸 | boolean | - | true |
| zIndex | Dialog层级 | number | - | 1000 |
| shadow | 是否显示Dialog阴影 | boolean | - | true |
| inline | 是否以内联方式显示 | boolean | - | false |
| left | Dialog左位置，inline为true时无效，left、top同时为null时，自动居中 | string | - | null |
| top | Dialog顶位置，inline为true时无效，left、top同时为null时，自动居中 | string | - | null |

# Hooks
| 钩子名称 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| onOpen | Dialog打开时的钩子 | 子组件实例 |
| onBeforeClose | Dialog关闭前的钩子，可以控制Dialog是否要关闭 | （子组件实例，关闭Dialog方法，关闭行为名称）  |
| onStartDrag | Dialog开始拖拽时的钩子 | （子组件实例，关闭Dialog方法，事件event） |
| onStopDrag | Dialog结束拖拽时的钩子 | （子组件实例，关闭Dialog方法，事件event） |
| onDrag | Dialog正在拖拽时的钩子 | （子组件实例，关闭Dialog方法，事件event） |
| onStartResize | Dialog开始改变尺寸时的钩子 | （子组件实例，关闭Dialog方法，事件event） |
| onStopResize | Dialog结束改变尺寸时的钩子 | （子组件实例，关闭Dialog方法，事件event） |
| onResize | Dialog正在改变尺寸时的钩子 | （子组件实例，关闭Dialog方法，事件event） |
| onMinimized | Dialog切换最小化时的钩子 | （子组件实例，关闭Dialog方法） |
| onMaximized | Dialog切换最大化时的钩子 | （子组件实例，关闭Dialog方法，当前放大状态） |
| onClick | Dialog被点击时的钩子 | （子组件实例，关闭Dialog方法，事件event） |

# Slots（模板语法）
| name | 说明 |
| ---- | ---- |
| title | 定义标题内容，设置了改插槽，参数title将无效 |
| tools | 定义操作按钮 |
| default | Dialog内容 |
| footer | 定义底部内容 |
