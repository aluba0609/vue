class Observer {
    constructor(data) {
        this.data = data;
        this.observer(data)
    }
    observer(obj) {
        if (obj && typeof obj === 'object') {
            // Object.keys(obj).reduce((data,currentKey)=>{
            //     if(data[currentKey]!=='object'){
            //         console.log(data)
            //         Object.defineProperty(data,currentKey,{
            //             enumerable:true,
            //             configurable:true,
            //             get:()=>{
            //                 return data[currentKey]
            //             },
            //             set:(newVal)=>{
            //                 if(newVal!==data[currentKey]){
            //                     data[currentKey]=newVal
            //                 }
            //             }
            //         })
            //     }else{
            //         this.observer(data[currentKey])
            //     }
            // },obj)
            Object.keys(obj).forEach(key => {
                this.defineReactive(obj, key, obj[key])
            })
        }
    }
    defineReactive(obj, key, value) {
        this.observer(value)//递归遍历
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: () => {
                return value
            },
            set: (newVal) => {
                this.observer(newVal)//防止设置新值为对象 应为新对象增加监听
                if (newVal !== value) {
                    value = newVal
                }
            }
        })
    }
}