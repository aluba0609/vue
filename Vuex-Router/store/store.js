import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from './Vuex'


Vue.use(Vuex)


export default new Vuex({
  state: {
    count: 1,
  },
  mutations: {
    add(state) {debugger
      return state.count++;
    }
  },
  actions: {
    add({ commit }) {
      setTimeout(() => {
        commit('add')
      }, 1000)
    }
  },
  modules: {},
  getters: {
    doubleCount(state) {
      return state.count * 2
    }
  }
})