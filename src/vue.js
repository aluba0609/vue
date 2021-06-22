const compileUtil={
    getVal(vm,key){
        return key.split(".").reduce((data,currentData)=>{
            return data[currentData]
        },vm.$data)
    },
    getContentVal(key,vm){
        return value=key.replace(/\{\{(.+?)\}\}/g,(...args)=>{
            return this.getVal(vm,args[1])
        })
    },
    text(node,vm,key){
        let value;
        if(key.indexOf("{{")!==-1){
            // console.log(key.replace(/\{\{.+?\}\}/g))//vue.js:10 undefined--undefined
            value=key.replace(/\{\{(.+?)\}\}/g,(...args)=>{//["{{person.name}}", "person.name", 0, "{{person.name}}--{{person.age}}"]
                //绑定观察者，将来数据变化  触发这里的回调
                new Watcher(vm,args[1],(newVal)=>{
                    // this.updater.textUpdater(node,newVal)
                    this.updater.textUpdater(node,this.getContentVal(key,vm))//重新取属性  防止把{{person.age}}干没了
                });
                return this.getVal(vm,args[1])
            })
        }else{
            value=this.getVal(vm,key);
        }
        this.updater.textUpdater(node,value)
    },
    html(node,vm,key){
        const value=this.getVal(vm,key);
        
        new Watcher(vm,key,(newval)=>{
            this.updater.htmlUpdater(node,newval)
        })
        this.updater.htmlUpdater(node,value)
    },
    on(node,vm,key,eventName){
        const fn=vm.$options.methods[key].bind(vm);
        node.addEventListener(eventName,fn,false)
    },
    setVal(vm,key,newval){
        key.split(".").reduce((data,currentData)=>{
            return data[currentData]=newval
        },vm.$data)
    },
    model(node,vm,key){
        const value=this.getVal(vm,key);
        new Watcher(vm,key,(newval)=>{
            this.updater.modelUpdater(node,newval)
        })
        node.addEventListener("input",(e)=>{
            this.setVal(vm,key,e.target.value)
        })
        this.updater.modelUpdater(node,value)
    },
    updater:{
        modelUpdater(node,value){
            node.value=value;
        },
        textUpdater(node,value){
            node.textContent=value;
        },
        htmlUpdater(node,value){
            node.innerHTML=value;
        }
    }
}
class Complie{
    constructor(el,vm){
        this.vm=vm
        this.el=this.isElementNode(el) ? el : document.querySelector(el);
        const fragment=this.nodeFragement(this.el)
        this.complie(fragment)
        this.el.appendChild(fragment)
    }
    isElementNode(node){
        return node.nodeType === 1;
    }
    nodeFragement(el){
        const f=document.createDocumentFragment();
        let firstChild;
        while(firstChild=el.firstChild){
            f.appendChild(firstChild)
        }
        return f;
    }
    complie(fragment){
        const childNodes=fragment.childNodes;
        [...childNodes].forEach(child=>{
        // childNodes.forEach(child=>{
            if(this.isElementNode(child)){
                this.complieElement(child)//元素节点
            }else{
                this.complieText(child)//文本节点
            }
            if(child.childNodes&&child.childNodes.length){
                this.complie(child)
            }
        })
    }
    complieElement(node){
        let attributes=node.attributes;
        // attributes.forEach(attr=>{
        [...attributes].forEach(attr=>{//需要扩展字符串 attributes可能存在空，目的就相当于是强制转换数组
            let {name,value}=attr;
            if(this.isDirective(name)){
                let [,directive]=name.split("-");
                let [dirName,eventName]=directive.split(":");
                compileUtil[dirName](node,this.vm,value,eventName)
            }else if(this.isEventName(name)){
                let [,eventName]=name.split("@")
                compileUtil["on"](node,this.vm,value,eventName)
            }
        })

    }
    complieText(node){
        const content=node.textContent
        if(/\{\{(.+?)\}\}/.test(content)){
            compileUtil["text"](node,this.vm,content)
        }
    }
    isEventName(attr){
        return attr.startsWith("@")
    }
    isDirective(attr){
        return attr.startsWith('v-')
    }
}
class Vue{
    constructor(options){
        this.$el = options.el;
        this.$data = options.data;
        this.$options = options;
        if(this.$el){
            new Observer(this.$data)
            new Complie(this.$el,this)
        }
    }
    
}