const arrayPrototype = Array.prototype;
//以Array.prototype为原型 创建arrayMethods
const arrayMethods = Object.create(arrayPrototype);//对象 {} 但是__proto__是指向数组的原型对象
const methodsNeedChange = [
    'push',
    'pop',
    'unshift',
    'shift',
    'splice',
    'sort',
    'reverse',
]
const def = function (obj, key, value, enumerable) {
    Object.defineProperty(obj, key, {
        value,
        enumerable,
        writable: true,
        configurable: true,
    })
}
methodsNeedChange.forEach(methodName => {
    const original = arrayPrototype[methodName];

    def(arrayMethods, methodName, function () {//别用箭头函数
        const args = [...arguments]
        //恢复原来的功能
        const result = original.apply(this, args)

        //可能存在数组中又有数组
        const ob = this.__ob__;
        let inserted = [];
        switch (methodName) {
            case 'push':
                inserted = args
                break;
            case 'unshift':
                inserted = args
                break;
            case 'splice':
                inserted = args.slice(2)
                break
        }
        //判断有没有插入的项
        if (inserted) {
            ob.observerArray(inserted)
        }
        ob.dep.notify()
        // console.log("进来改造",args)
        return result//pop splice会有返回值
    }, false)
})

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
            console.log(newval)
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
        console.log("通知观察")
        this.subs.forEach(w => w.update())
    }
}
class Observer {
    constructor(data) {
        this.observer(data)
    }
    observer(data) {
        if (data && typeof data === 'object') {
            if (Array.isArray(data)) {
                def(data, '__ob__', this, false)
                //如果是数组
                Object.setPrototypeOf(data, arrayMethods)
                this.observerArray(data)
            } else {
                Object.keys(data).forEach(key => {
                    this.defineReactive(data, key, data[key])
                })
            }
        }
    }
    defineReactive(obj, key, value) {
        this.observer(value)
        const dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                console.log("更改数组")
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
    observerArray(arr) {
        for (let i = 0, l = arr.length; i < l; i++) {//处理 unshift push splice
            this.observer(arr[i])
        }
    }
}