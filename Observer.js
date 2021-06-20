class Observer{
    constructor(data){
        this.observer(data)
    }
    observer(data){
        if(data && typeof data ==='object'){
            Object.keys(data).forEach(key=>{
                this.defineReactive(data,key,data[key])
            })
        }
    }
    defineReactive(obj,key,value){
        this.observer(value)
        Object.defineProperty(obj,key,{
            enumerable:true,
            configurable:true,
            get(){
                //订阅数据变化时，往Dep中添加观察者
                return value;
            },
            set:(newval)=>{
                this.observer(newval)//防止对整个对象更改  导致新的属性没有被监听
                if(newval!==value){
                    value=newval
                }
            }
        })
    }
}