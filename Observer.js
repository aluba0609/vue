class Watch {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        //先把久值保存起来
        this.oldval = this.getOldVal()
    }
    getOldVal() {
        Dep.target = this;
        const oldval = compileUtil.getVal(this.expr, this.vm);
        Dep.target = null;
        return oldval
    }
    update() {
        const newval = compileUtil.getVal(this.expr, this.vm);
        if (newval !== this.oldval) {
            this.cb(newval)
        }
    }
}
class Dep {
    constructor() {
        this.subs = []
    }
    //收集观察者
    addSub(watcher) {
        this.subs.push(watcher)
    }
    //通知观察者去更新
    notify() {
        this.subs.forEach(w => w.update())
    }
}
class Observer {
    constructor(data) {
        this.observer(data)
    }
    observer(data) {
        if (data && typeof data === 'object') {
            Object.keys(data).forEach(key => {
                this.defineReactive(data, key, data[key])
            })
        }
    }
    defineReactive(obj, key, value) {
        this.observer(value)
        const dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                //订阅数据变化时，往Dep中添加观察者
                Dep.target && dep.addSub(Dep.target)
                return value;
            },
            set: (newval) => {
                this.observer(newval)//防止对整个对象更改  导致新的属性没有被监听
                if (newval !== value) {
                    value = newval
                    console.log(value)
                }
                //告诉Dep通知变化
                dep.notify()
            }
        })
    }
}