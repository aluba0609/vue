获得元素节点方法
document.getElementById("id");// 返回一个节点
document.getElementsByName("name");// 全局，返回节点数组
(document|Element). getElementsByTagName (" 标签名 "); // 全局，某一节点下，返回节点数组
 
获得属性节点方法
Element. getAttribute(" 属性名 ");// 返回值
 
获得文本节点
1. Element. firstChild. nodeValue;// 通过属性方式
2. Element.innerText; // 通过属性方式
3.Element .innerHTML;