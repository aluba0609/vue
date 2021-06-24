// import Vue from "vue";
let Vue;

class Vuex {
    constructor(options) {
        this._vm = new Vue({//响应式处理 Vue.util.defineReactive只能处理一个属性
            data: {
                $$state: options.state
            }
        })
        this._mutations = options.mutations;
        this._actions = options.actions;
        this.getters = {};
        options.getters && this.handleGetters(options.getters)
    }
    handleGetters(getters) {
        Object.keys(getters).map(key => {
            Object.defineProperty(this.getters, key, {
                get: () => {
                    getters[key](this.state)
                }
            })
        })
    }
    get state() {
        return this._vm._data.$$state;
    }
    set state(v) {
        console.error("不允许修改")
    }
    commit=(type, payload)=>{//用react思想 使用箭头函数 改变里面的this
        const entry = this._mutations[type]
        if (!entry) {
            console.error("无此参数")
        }
        entry(this.state, payload)
    }
    dispatch=(type, payload)=> {
        const entry = this._actions[type]
        console.log(entry)
        if (!entry) {
            console.error("无此参数")
        }
        entry(this, payload)
    }
    static install (_Vue) {
        Vue = _Vue;

        Vue.mixin({
            beforeCreate() {debugger
                if (this.$options.store) {//this指向Vue实例 this.$options 能获取到new Vue传进去的所有参数

                    Vue.prototype.$store = this.$options.store
                }
            }
        })
    }

}
export default Vuex