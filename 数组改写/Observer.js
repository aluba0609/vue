const arrayPrototype = Array.prototype
const arrayMethods = Object.create(arrayPrototype)
console.log(arrayMethods)
const methodsNeedChange = [
    'push',
    'pop',
    'unshift',
    'shift',
    'splice',
    'sort',
    'reverse'
]
function def(arrayMethods,method,value){
    Object.defineProperty(arrayMethods,method,{
        value:value,
        enumerable:false,
        writable: true,
        configurable: true,
    })
}
methodsNeedChange.forEach(method=>{
    const oriainMethod=arrayMethods[method];
    def(arrayMethods,method,function(){
        const args=[...arguments]
        const result=oriainMethod.apply(this,args)
        const ob = this.__ob__;
        let inserted = [];
        switch (method) {
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
        return result//pop splice会有返回值
    })
})
class Watch {
    constructor(vm, key, fn) {
        this.vm = vm;
        this.key = key;
        this.fn = fn;
        this.oldVal = this.getOldVal()
    }
    getOldVal() {
        Dep.target = this;
        const oldVal = compileUtil.getVal(this.key, this.vm)
        Dep.target = null;
        return oldVal
    }
    updater() {
        const newVal = compileUtil.getVal(this.key, this.vm)
        this.fn(newVal)
    }
}
class Dep {
    constructor() {
        console.log("调用次数")
        this.subs = [];
    }
    addSubs(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach(w => { w.updater() })
    }
}
class Observer {
    constructor(options) {
        this.observer(options)
    }
    observer(options) {
        if (typeof options === 'object') {
            Object.keys(options).forEach((key) => {
                this.defineReactive(options, key, options[key])
            })
        }

    }
    defineReactive(data, key, value) {
        const dep=this.dep||new Dep()
        if(Array.isArray( value)){
            Object.setPrototypeOf(value,arrayMethods)
            this.dep=dep;
            def(value,'__ob__',this)
            this.observerArray(value)
            
        }
        this.observer(value)
        Object.defineProperty(data, key, {
            get: function getObjectVal() {
                Dep.target && dep.addSubs(Dep.target)
                return value;
            },
            set: function setObjectVal(newVal) {
                if (newVal !== value) {
                    value = newVal
                    dep.notify()
                }
            }
        })
    }
    observerArray(value){
        value.forEach(key=>{
            this.observer(key)
        })
    }
}