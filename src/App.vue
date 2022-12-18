<script setup lang="ts">
import { ref } from 'vue'

import AppState, { AppPage } from './types/AppState'
import Edit from './components/Edit.vue'
import SelectTemplate from './components/SelectTemplate.vue'

const appState = ref(new AppState());
</script>

<template>
  <SelectTemplate :appState=appState v-if="appState.page == AppPage.SelectTemplate" />
  <Edit :appState=appState v-if="appState.page == AppPage.Edit" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.margin-top-min {
	margin-top: 1rem;
}


</style>
