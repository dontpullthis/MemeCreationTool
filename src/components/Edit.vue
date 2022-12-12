<script setup lang="ts">
import { ref, Ref } from 'vue'

import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';

import AppState, { AppPage } from '../types/AppState'

</script>

<template>
	<h1>Step 2. Edit</h1>

</template>

<style scoped>

</style>

<script lang="ts">


export default {
	props: {
		appState: {
			type: AppState,
			required: true,
		}
	},
	methods: {
	}
}
</script>