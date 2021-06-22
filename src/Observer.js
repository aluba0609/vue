class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm;
        this.key = key;
        this.cb = cb;
        this.oldval = this.getOldVal()
    }
    update() {
        const newval = compileUtil.getVal(this.vm, this.key);
        if (newval !== this.oldval) {
            this.cb(newval)
        }
    }
    getOldVal() {
        Dep.target = this;
        const oldval = compileUtil.getVal(this.vm, this.key);
        Dep.target = null;
        return oldval;
    }
}
class Dep {
    constructor() {
        this.subs = [];
    }
    addSubs(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach(w => w.update())
    }
}
class Observer {
    constructor(data) {
        this.observer(data)
        // this.dep=new Dep();//不能在此处new 会把所有的观察者集合到同一个dep.subs 一但数据更新  所有的subs全部会被触发
    }
    observer(obj) {
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
                this.defineReactive(obj, key, obj[key])
            })
        }
    }
    defineReactive(obj, key, value) {
        this.observer(value)//递归遍历
        const dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: () => {
                Dep.target && dep.addSubs(Dep.target)
                dep.subs.length && console.log('我是', key + '的：', dep.subs)
                return value
            },
            set: (newVal) => {
                this.observer(newVal)//防止设置新值为对象 应为新对象增加监听
                if (newVal !== value) {
                    value = newVal;
                    dep.notify()
                }
            }
        })
    }
}