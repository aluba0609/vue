let Vue;
class VueRouter {
    constructor(options) {//是routes
        this.$options = options;
        // this.current="/";//需要变成响应式的数据  数据一但变化数据将立马执行
        let inital = window.location.hash.slice(1) || "/";
        Vue.util.defineReactive(this, "current", inital)
        window.addEventListener("hashchange", () => {
            this.current = window.location.hash.slice(1) || "/";
        })
    }
    static install(_Vue){
        Vue = _Vue;
        //全局混入 （延迟下面的逻辑到router创建完毕并且附加到选项是才执行）

        Vue.mixin({
            beforeCreate() {//此处的this 应该指向调用他的实例  首次进来指向Vue  然后每个组件调用，指向VueComponent
                //注意此钩子，在每一个组件创建市里的时候 都会调用
                //根实例才会有此选项
                if (this.$options.router) {//this指向Vue实例的时候会设定Vue.prototype.$router 
                    Vue.prototype.$router = this.$options.router;//route
                }
            }
        })
        //    <router-link to="/">Home</router-link>  =>转化为<a href="/">Home</a>
        Vue.component("router-link", {
            props: {
                to: {
                    type: String,
                    require: true,
                }
            },
            render(h) {
                return h(
                    "a",//标签元素
                    {
                        attrs: {
                            href: `#${this.to}`//标签上的属性
                        }
                    },
                    this.$slots.default//标签中的内容
                )
            }
        })
        Vue.component("router-view", {
            render(h) {
                let component = null;
                let current = this.$router.current;
                //里面的this被进行代理了   指向了$root, Vue这个实例
                //this.$router.$options.routes是mixin里增加了Vue.prototype.$router
                //this.$router.$options.routes  =>this.root.$options.router.$options.routes.
                const route = this.$router.$options.routes.find(
                    (route) => route.path === current
                )
                if (route) {
                    component = route.component
                }
                return h(component)
            }
        })
    }
}
export default VueRouter;


// let Vue
// class VueRouter {
//     constructor(options) {
//         this.$options = options;
//         let inital = window.location.hash.slice(1) || '/';
//         Vue.util.defineReactive(this, 'current', inital)
//         addEventListener('hashchange', () => {
//             this.current = window.location.hash.slice(1) || '/';
//         })
//     }
//     static install(_Vue) {
//         Vue = _Vue;
//         Vue.mixin({
//             beforeCreate() {
//                 if (this.$options.router) {
//                     Vue.prototype.$router = this.$options.router
//                 }
//             }
//         })
//         Vue.component(
//             'router-link',
//             {
//                 props: {
//                     to: String,
//                     require: true,
//                 },
//                 render(h) {
//                     return h('a', {
//                         attrs: {
//                             href: `#${this.to}`
//                         }
//                     },
//                         this.$slots.default
//                     )
//                 }

//             }
//         ),
//             Vue.component(
//                 'router-view',
//                 {
//                     render(h) {
//                         let component = null;
//                         let current = this.$router.current
//                         let route = this.$router.$options.routes.find((route) => {
//                             return route.path === current
//                         })
//                         if (route) {
//                             component = route.component
//                         }
//                         return h(component)
//                     }
//                 }
//             )

//     }
// }
// export default VueRouter;

