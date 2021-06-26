const arrayPrototype=Array.prototype
const arrayMethod=Object.create(arrayPrototype)
const arrayNeedChange=[
    'push',
    'pop',
    'shift',
    'unshift',
    'sort',
    'splice',
    'reversr'
]
function def(arrayMethod,method,value){
    Object.defineProperty(arrayMethod,method,{
        value:value,
        configurable:true,
        enumerable:false,
        writable:true,
    })
}
arrayNeedChange.forEach(method=>{
    const oriainMethod=arrayMethod[method]
    def(arrayMethod,method,function(){debugger
        const args=[...arguments]
        console.log(args,"+++++++++++++++++")
        const result =oriainMethod.apply(this,args)
        const ob=this.__ob__;
        let inserted=[]
        switch(method){
            case 'push':
                inserted=args;
                break
            case 'unshift':
                inserted=args;
                break
            case 'splice':
                console.log(args,"splice")
                inserted=args.slice(2)
                break
        }
        if(inserted){
            ob.observerArray(inserted)
        }
        
        ob.dep.notify()
        return result
    })
})
class Watch{
    constructor(vm,key,cb){
        this.vm=vm;
        this.key=key;
        this.cb=cb;
        this.oldVal=this.getOldVal();
    }
    getOldVal(){
        Dep.target=this;
        const oldVal=compileUtil.getVal(this.key,this.vm);
        Dep.target=null
        return oldVal
    }
    updater(){
        const newVal=compileUtil.getVal(this.key,this.vm);
        // if(newVal!==this.oldVal){
            console.log(newVal)
            this.cb(newVal)
        // }
    }
}
class Dep {
    constructor() {
        this.subs = []
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
            Object.keys(options).forEach(key => {
                this.observeReactive(options, key, options[key])
            })
        }
    }
    observeReactive(obj, key, value) {
        const dep=this.dep||new Dep()//當插入多重數組的時候  數組存在dep  所以不應該再次new
        if(Array.isArray(value)){
            Object.setPrototypeOf(value,arrayMethod)
            this.dep=dep;
            def(value,'__ob__',this)
            this.observerArray(value)
        }else{
            this.observer(value)
        }
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function getVal() {
                Dep.target&&dep.addSubs(Dep.target)
                return value;
            },
            set: function setValue(newVal) {
                if (newVal !== value) {debugger
                    value = newVal
                    dep.notify()
                }
            }
        })
    }
    observerArray(arr){
        arr.forEach(key=>{
            this.observer(key)
        })
    }
}