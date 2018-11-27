import Vuex from 'vuex';
import state from "./state";
import mutations from "./mutations";

Vue.use(Vuex);

export function createStore () {
  return new Vuex.Store({
	  state,
	  mutations,
	})
}