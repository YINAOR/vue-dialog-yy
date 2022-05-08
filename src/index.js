import Vue from 'vue'
import Dialog from './Dialog.vue'
import { Button, Container, Header, Main, Footer } from 'element-ui'

export default {
	install: (Vue, { store, router, registerComponent }) => {
		// 如果没有注册Dialog相关的element-ui组件，则自动注册相关组件为局部组件
		if (Vue.options.components) {
			const list = {
				ElButton: Button,
				ElContainer: Container,
				ElHeader: Header,
				ElMain: Main,
				ElFooter: Footer,
			}
			for (let name in list) {
				if (!Vue.options.components[name]) {
					ElementUIComponent[name] = list[name]
				}
			}
		}
		store && (instanceStore = store)
		router && (instanceRouter = store)
		Vue.prototype.$dialog = dialog
		if (registerComponent) {
			Vue.component(registerComponent, Dialog)
		}
	},
}

let instance = null
let persistentInstances = {}
let instanceStore = null
let instanceRouter = null
const ElementUIComponent = {}

/**
 *
 * @param {标题} title
 * @param {组件或内容} child
 * @param {窗体属性和方法} pOpts
 * @param {子组件属性和方法} cOpts
 * @returns
 */
async function dialog(title, child, pOpts = {}, cOpts = {}) {
	if (!child) {
		alert('缺少显示的组件或内容！')
		throw new Error('缺少显示的组件或内容！')
	}
	if (pOpts.minimizable && !pOpts.id) {
		alert('最小化功能需要设置唯一id！')
		throw new Error('最小化功能需要设置唯一id！')
	}

	if (pOpts.id) {
		instance = persistentInstances[pOpts.id]
		// 若存在实例，将弹窗实例修改为打开状态
		instance && (instance.minimized = false)
	}

	// 确保钩子的this指向正确
	const _this = this

	if (!instance) {
		// 根据child生成显示内容
		let ChildComponent
		if (child instanceof Promise) {
			// 如果传入模块
			try {
				await child.then(module => {
					ChildComponent = module.default
				})
			} catch (error) {
				throw new Error(error)
			}
		} else if (typeof child === 'string') {
			// 如果传入模板字符串
			ChildComponent = Vue.extend({
				template: `<div>${child}</div>`,
			})
		} else {
			// 如果传入VNode，暂不考虑
		}

		const showCancelButton = Reflect.has(pOpts, 'showCancelButton') ? Boolean(pOpts.showCancelButton) : true
		const cancelButtonText = pOpts.cancelButtonText || '取消'
		const showConfirmButton = Reflect.has(pOpts, 'showConfirmButton') ? Boolean(pOpts.showConfirmButton) : true
		const confirmButtonText = pOpts.confirmButtonText || '确认'
		const cancelButtonSize = pOpts.cancelButtonSize || 'small'
		const confirmButtonSize = pOpts.confirmButtonSize || 'small'
		const customButtons = Reflect.has(pOpts, 'customButtons') ? pOpts.customButtons : []

		instance = new Vue({
			store: instanceStore,
			routeer: instanceRouter,
			components: {
				Dialog,
				ChildComponent,
				...ElementUIComponent,
			},
			data() {
				return {
					promise: null,
					closed: false,
					minimized: false,
					maximized: false,
					customButtons: pOpts.customButtons,
				}
			},
			render(h) {
				const cancelButton = showCancelButton
					? h(
							'el-button',
							{
								props: {
									plain: true,
									size: cancelButtonSize,
								},
								on: {
									click: () => this.handleClose('cancel'),
								},
							},
							cancelButtonText
					  )
					: ''
				const confirmButton = showConfirmButton
					? h(
							'el-button',
							{
								props: {
									plain: true,
									size: confirmButtonSize,
									type: 'primary',
								},
								on: {
									click: () => this.handleClose('confirm'),
								},
							},
							confirmButtonText
					  )
					: ''
				const customButtonsDom = customButtons.map(btn => {
					let clickEvent = () => {}
					if (btn.click instanceof Function) {
						clickEvent = () => btn.click.call(_this, this.$refs.child, this.handleClose, btn)
					}
					return h(
						'el-button',
						{
							props: {
								plain: true,
								size: btn.size || 'small',
								type: btn.type || '',
								loading: btn.loading || false,
							},
							on: {
								click: clickEvent,
							},
						},
						btn.text
					)
				})
				const footer =
					customButtonsDom.length || showCancelButton || showConfirmButton
						? h('template', { slot: 'footer' }, [cancelButton, confirmButton, ...customButtonsDom])
						: ''

				return h(
					'Dialog',
					{
						ref: 'dialog',
						class: pOpts.customClass,
						props: {
							...pOpts,
							title: title,
							closed: this.closed,
							minimized: this.minimized,
							maximized: this.maximized,
							minimizable: !!pOpts.minimizable,
							maximizable: !!pOpts.maximizable,
						},
						on: {
							'on-closed': () => this.handleClose('close'),
							'on-minimized': this.handleMinimized,
							'on-maximized': this.handleMaximized,
							'on-start-drag': this.handleStartDrag,
							'on-stop-drag': this.handleStopDrag,
							'on-drag': this.handleDrag,
							'on-start-resize': this.handleStartResize,
							'on-stop-resize': this.handleStopResize,
							'on-resize': this.handleResize,
							'on-click': this.handleClick,
						},
					},
					[
						h('ChildComponent', {
							ref: 'child',
							props: {
								...separate(cOpts, _this).props,
							},
							on: {
								'on-closed': () => this.handleClose('close'),
								...separate(cOpts, _this, this.handleClose).events,
							},
						}),
						footer,
					]
				)
			},
			methods: {
				handleClose(action) {
					pOpts.onBeforeClose ? this.handleBeforeClose(action) : this.close(action)
				},
				handleBeforeClose(action) {
					pOpts.onBeforeClose && pOpts.onBeforeClose.call(_this, this.$refs.child, this.close, action)
				},
				close(action) {
					this.promise && this.promise.resolve(action)
					this.closed = true
					this.$destroy()
					if (pOpts.id && persistentInstances[pOpts.id] === instance) {
						delete persistentInstances[pOpts.id]
					}
					instance = null
				},
				handleMinimized() {
					this.minimized = true
					persistentInstances[pOpts.id] = instance
					pOpts.onMinimized && pOpts.onMinimized.call(_this, this.$refs.child)
				},
				handleMaximized(currentMaximized) {
					this.maximized = currentMaximized
					pOpts.onMaximized && pOpts.onMaximized.call(_this, this.$refs.child, this.handleClose, currentMaximized)
				},
				handleStartDrag(e) {
					pOpts.onStartDrag && pOpts.onStartDrag.call(_this, this.$refs.child, this.handleClose, e)
				},
				handleStopDrag(e) {
					pOpts.onStopDrag && pOpts.onStopDrag.call(_this, this.$refs.child, this.handleClose, e)
				},
				handleDrag(e) {
					pOpts.onDrag && pOpts.onDrag.call(_this, this.$refs.child, this.handleClose, e)
				},
				handleStartResize(e) {
					pOpts.onStartResize && pOpts.onStartResize.call(_this, this.$refs.child, this.handleClose, e)
				},
				handleStopResize(e) {
					pOpts.onStopResize && pOpts.onStopResize.call(_this, this.$refs.child, this.handleClose, e)
				},
				handleResize(e) {
					pOpts.onResize && pOpts.onResize.call(_this, this.$refs.child, this.handleClose, e)
				},
				handleClick(e) {
					pOpts.onClick && pOpts.onClick.call(_this, this.$refs.child, this.handleClose, e)
				},
			},
		}).$mount()
	}

	pOpts.onOpen && pOpts.onOpen.call(_this, instance.$refs.child, this.handleClose)

	return new Promise((resolve, reject) => {
		instance.promise = {
			resolve,
			reject,
		}
	})
}

function separate(cOpts, p, done) {
	const obj = {
		props: {},
		events: {},
	}
	if (cOpts) {
		const pattern = /^on[A-Z]+/
		Object.keys(cOpts).forEach(key => {
			if (pattern.test(key)) {
				obj.events[key] = data => cOpts[key].call(p, data, done)
			} else {
				obj.props[key] = cOpts[key]
			}
		})
	}
	return obj
}
