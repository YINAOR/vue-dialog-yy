<template>
	<div
		v-if="!currentClosed"
		v-show="!currentMinimized"
		class="yy-dialog__wrapper"
		:class="wrapperClasses"
		:style="wrapperStyles"
		@click.stop="handleClick"
	>
		<transition name="el-fade-in">
			<div class="yy-dialog__modal" v-if="!currentClosed && !currentMinimized && modal && !inline" @click.stop="handleClickModal"></div>
		</transition>
		<transition name="el-fade-in">
			<section
				v-if="!currentClosed"
				v-show="!currentMinimized"
				class="el-container yy-dialog is-vertical"
				:class="classes"
				:style="styles"
				v-draggable="draggableOptions"
				v-resizable="resizableOptions"
			>
				<header
					class="el-header yy-dialog__header"
					:height="headerHeight"
					:style="{ height: headerHeight, background: headerBackground }"
					v-if="hasHeader"
				>
					<slot name="icon">
						<div class="yy-dialog__icon" v-if="icon"><i :class="`${icon}`"></i></div>
					</slot>
					<div class="yy-dialog__title">
						<slot name="title">{{ title }}</slot>
					</div>
					<div class="yy-dialog__tools">
						<slot name="tools"></slot>
						<span class="yy-dialog__tool" v-if="minimizable" @click.stop="handleMinimized"><i :class="icons[2]"></i></span>

						<span class="yy-dialog__tool" v-if="maximizable" @mousedown.stop @click.stop="handleMaximized">
							<i v-if="currentMaximized" :class="icons[3]" style="transform: rotate(180deg)"></i>
							<i v-else :class="icons[4]"></i>
						</span>
						<span class="yy-dialog__tool" v-if="closable" @mousedown.stop @click="handleClosed($event)"><i :class="icons[5]"></i></span>
					</div>
				</header>
				<main class="el-main yy-dialog__body">
					<slot></slot>
				</main>
				<footer class="el-footer yy-dialog__footer" :style="{ height: footerHeight, background: footerBackground }" v-if="$slots.footer">
					<slot name="footer">
						<el-button plain size="small" @click.stop="handleClosed">取消</el-button>
						<el-button plain size="small" type="primary" @click.stop="handleClosed">确认</el-button>
					</slot>
				</footer>
			</section>
		</transition>
	</div>
</template>

<script>
import draggable from './utils/draggable'
import resizable from './utils/resizable'
import ElButton from './ElButton'

export default {
	name: 'Dialog',
	components: {
		ElButton,
	},
	directives: {
		draggable,
		resizable,
	},
	props: {
		// 标题
		title: {
			type: String,
		},
		// 自定义类名
		customClass: {
			type: String,
		},
		// header背景
		headerBackground: {
			type: String,
			default: '#e8f4ff',
		},
		// footer背景
		footerBackground: {
			type: String,
			default: '#fff',
		},
		// 标题图标
		icon: {
			type: String,
		},
		// 宽度
		width: {
			type: [String, Number],
			default: '500px',
		},
		// 高度
		height: {
			type: [String, Number],
			default: 'auto',
		},
		// 最大高度
		maxHeight: {
			type: [String, Number],
			default: 'auto',
		},
		// 左位置
		left: {
			type: [String, Number],
			default: null,
		},
		// 上位置
		top: {
			type: [String, Number],
			default: null,
		},
		// 能否关闭
		closable: {
			type: Boolean,
			default: true,
		},
		// 能否最大化
		maximizable: {
			type: Boolean,
			default: false,
		},
		// 能否最小化
		minimizable: {
			type: Boolean,
			default: false,
		},
		// 是否关闭
		closed: {
			type: Boolean,
			default: false,
		},
		// 是否最小化
		minimized: {
			type: Boolean,
			default: false,
		},
		// 是否最大化
		maximized: {
			type: Boolean,
			default: false,
		},
		// 是否需要遮罩层
		modal: {
			type: Boolean,
			default: true,
		},
		// 是否可以通过点击 modal 关闭弹窗
		closeOnClickModal: {
			type: Boolean,
			default: true,
		},
		// 是否可以通过按下 ESC 关闭弹窗
		closeOnPressEscape: {
			type: Boolean,
			default: true,
		},
		// 是否开启拖拽
		draggable: {
			type: [Boolean, Object],
			default: false,
		},
		// 是否能改变尺寸
		resizable: {
			type: [Boolean, Object],
			default: false,
		},
		// 头部高度
		headerHeight: {
			type: String,
			default: '40px',
		},
		// 底部高度
		footerHeight: {
			type: String,
			default: '40px',
		},
		// 层级
		zIndex: {
			type: Number,
			default: 1000,
		},
		// 边框是否需要阴影
		shadow: {
			type: Boolean,
			default: true,
		},
		// 是否以内联方式显示
		inline: {
			type: Boolean,
			default: false,
		},
		// 是否插入至 body 元素上。嵌套的 Dialog 必须指定该属性并赋值为 true
		appendToBody: {
			type: Boolean,
			default: true,
		},
		// 右上角的图标
		icons: {
			type: Array,
			default() {
				return ['el-icon-caret-bottom', 'el-icon-caret-top', 'el-icon-minus', 'el-icon-copy-document', 'el-icon-full-screen', 'el-icon-close']
			},
		},
	},
	data() {
		return {
			currentMinimized: this.minimized,
			currentMaximized: this.maximized,
			currentClosed: this.closed,
		}
	},
	watch: {
		minimized(val) {
			this.currentMinimized = val
		},
		maximized(val) {
			this.currentMaximized = val
		},
		closed(val) {
			this.currentClosed = val
			if (!val && this.appendToBody && this.$el && !this.inline) {
				document.body.appendChild(this.$el)
			}
		},
	},
	computed: {
		hasHeader() {
			return this.title !== null
		},
		wrapperClasses() {
			const className = []
			this.inline && className.push('is-inline')
			this.customClass && className.push(this.customClass)
			return className
		},
		wrapperStyles() {
			return {
				'z-index': this.zIndex,
				height: this.inline ? this.height : 'auto',
			}
		},
		classes() {
			return {
				'is-center': !this.inline && !this.resizable && this.left === null && this.top === null,
				'is-minimized': this.currentMinimized,
				'is-maximized': this.currentMaximized,
				'is-shadow': this.shadow,
				'is-inline': this.inline,
			}
		},
		styles() {
			let style = {}
			if (this.currentMaximized) {
				style = {
					left: 0,
					top: 0,
				}
				return style
			}
			style = {
				width: this.width,
				height: this.height,
				'max-height': this.maxHeight,
			}
			if (this.resizable) {
				const clientWidth = window.innerWidth
				const clientHeight = window.innerHeight
				style.left = this.left || `${(clientWidth - parseInt(style.width) || 0) / 2}px`
				style.top = this.top || `${(clientHeight - (parseInt(style.height) || 0)) / 2}px`
			} else {
				if (this.left !== null) style.left = this.left
				if (this.top !== null) style.top = this.top
			}
			return style
		},
		draggableOptions() {
			if (this.title === null || this.inline) {
				return false
			}
			return this.draggable
				? Object.assign(
						{
							handle: '.yy-dialog__header',
							onStartDrag: e => {
								/**
								 * 开始拖拽时触发
								 * @param {object} e 拖拽事件对象
								 */
								this.$emit('on-start-drag', e)
							},
							onStopDrag: e => {
								/**
								 * 拖拽结束时触发
								 * @param {object} e 拖拽事件对象
								 */
								this.$emit('on-stop-drag', e)
							},
							onDrag: e => {
								/**
								 * 正在拖拽时触发
								 * @param {object} e 拖拽事件对象
								 */
								this.$emit('on-drag', e)
							},
						},
						this.draggable
				  )
				: false
		},
		resizableOptions() {
			return this.resizable
				? Object.assign(
						{
							minWidth: 100,
							minHeight: 41,
							onStartResize: e => {
								/**
								 * 开始改变尺寸时触发
								 * @param {object} e resize事件对象
								 */
								this.$emit('on-start-resize', e)
							},
							onStopResize: e => {
								/**
								 * 改变尺寸结束时触发
								 * @param {object} e resize事件对象
								 */
								this.$emit('on-stop-resize', e)
							},
							onResize: e => {
								/**
								 * 正在改变尺寸时触发
								 * @param {object} e resize事件对象
								 */
								this.$emit('on-resize', e)
							},
						},
						this.resizable
				  )
				: false
		},
	},
	methods: {
		handleMinimized() {
			this.currentMinimized = true
			this.$emit('update:minimized', this.currentMinimized)
			/**
			 * 最小化时触发
			 * @event on-minimized
			 */
			this.$emit('on-minimized', this)
		},
		handleMaximized() {
			this.currentMaximized = !this.currentMaximized
			this.$emit('update:maximized', this.currentMaximized)
			/**
			 * 最大化时触发
			 * @event on-maximized
			 */
			this.$emit('on-maximized', this.currentMaximized, this)
		},
		handleClosed() {
			this.currentClosed = true
			this.$emit('update:closed', this.currentClosed)
			/**
			 * 窗体关闭触发
			 * @event on-closed
			 */
			this.$emit('on-closed', this)
		},
		handleClick() {
			this.$emit('on-click')
		},
		handleClickModal() {
			this.closeOnClickModal && this.handleClosed()
		},
		keyupFn(e) {
			e instanceof Event && e.stopPropagation()
			console.log(e)
			if (e.key === 'Escape') {
				this.handleClosed()
			}
		},
	},
	mounted() {
		if (this.appendToBody && this.$el && !this.inline) {
			document.body.appendChild(this.$el)
			this.closeOnPressEscape && document.addEventListener('keyup', this.keyupFn)
		}
	},
	destroyed() {
		if (this.appendToBody && this.$el && this.$el.parentNode && !this.inline) {
			this.$el.parentNode.removeChild(this.$el)
			this.closeOnPressEscape && document.removeEventListener('keyup', this.keyupFn)
		}
	},
}
</script>
<style lang="scss" scoped>
@import './style/index.scss';
@import './element-ui.css';
</style>
