const compileUtil={
    getVal(expr,vm){
        return expr.split('.').reduce((data,currentVal)=>{
            return data[currentVal]
        },vm.$data)
    },
    text(node,expr,vm){
        let value;
        if(expr.indexOf("{{")!==-1){
            value=expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{//["{{person.name}}", "person.name", 0, "{{person.name}}--{{person.age}}"]
                return this.getVal(args[1],vm)
            })
        }else{
            value=this.getVal(expr,vm);
        }
        this.updater.textUpdater(node,value)
    },
    html(node,expr,vm){
        const value=this.getVal(expr,vm);
        this.updater.htmlUpdater(node,value)
    },
    model(node,expr,vm){
        const value=this.getVal(expr,vm);
        this.updater.modelUpdater(node,value)

    },
    on(node,expr,vm,eventName){
        let fn=vm.$options.methods[expr].bind(vm);
        node.addEventListener(eventName,fn,false)
    },
    bind(node,expr,vm,attrName){
        //待更新
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
class Compile{
    constructor(el,vm){
        this.el=this.isElementNode(el) ? el :document.querySelector(el);
        this.vm=vm;
        //获取文档碎片对象 放入内存中会减少页面的回流和重绘
        const fragment=this.nodeFragment(this.el)
        this.compile(fragment)
        this.el.appendChild(fragment)
    }
    compile(fragment){
        const childNode = fragment.childNodes;
        [...childNode].forEach(child=>{
            if(this.isElementNode(child)){//如果是元素节点
                this.compileElement(child)

            }else{//文本节点
                this.compileText(child)
            }
            if(child.childNodes&&child.childNodes.length){
                this.compile(child)
            }
        })
    }
    compileElement(node){
        let attributes =node.attributes;

        [...attributes].forEach(attr=>{
            let {name,value}=attr;//{v-test,msg}
            if(this.isDirective(name)){//判断是否以v-开头
                let [,directive]=name.split('-');//test  html model on:click
                let [dirName,eventName]=directive.split(':');//[on,click]
                compileUtil[dirName](node,value,this.vm,eventName)//更新数据  数据驱动视图
                node.removeAttribute("v-"+directive)//删除有指令的标签上的属性
            }else if(this.isEventName(name)){
                let [,eventName]=name.split("@");
                compileUtil['on'](node,value,this.vm,eventName)
            }
        })
    }
    compileText(node){
        const content=node.textContent;
        if( /\{\{(.+?)\}\}/.test(content) ){
            //  {{person.name}}--{{person.age}}
            //  {{person.fav}}
            //  {{msg}}
            compileUtil['text'](node,content,this.vm)
        }
    }
    isEventName(attrName){
        return attrName.startsWith("@")
        
    }
    isDirective(attrName){
        return attrName.startsWith("v-")
    }
    nodeFragment(el){
        //创建文档碎片
        const f=document.createDocumentFragment(el);
        let firstChilds;
        while(firstChilds=el.firstChild){//会便利
            // fragment.appendChild()//具有移动性相当于把el中节点移动过去
            f.appendChild(firstChilds) //这段代码的目的就是移动el.firstChild
        }
        return f
    }
    isElementNode(node){
        return node.nodeType ===1
    }
}

class Vue {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;
        this.$options = options;
        if(this.$el){
            //1.实现一个数据观察者
            new Observer(this.$data)
            //实现一个指令解析器
            new Compile(this.$el,this)
        }
    }
}