import Vue from 'vue'
import Router from './vue-router'
// import Router from 'vue-router'

import HelloWorld from './HelloWorld'
import about from './About'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/about',
      name: 'about',
      component: about
    }
  ]
})
