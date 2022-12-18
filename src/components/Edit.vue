<script setup lang="ts">
import { fabric } from 'fabric';

import Button from 'primevue/button';
import Card from 'primevue/card';

import AppState, { AppPage } from '../types/AppState'

defineProps({
	appState: {
		type: AppState,
		required: true,
	}
});
</script>

<template>
	<h1>Step 2. Edit</h1>

	<div style="display: flex;">
		<div style="flex: 3 3;">
			<Card style="flex: 1 1">
				<template #content>
					<canvas id="canvas"></canvas>
				</template>
			</Card>
		</div>
		<div style="flex: 1 1; display: flex; margin-left: 1rem;">
			
			<Card style="display: flex; width: 100%;">
				<template #title>
					Tools
				</template>
				<template #content>

				</template>
			</Card>
		</div>
	</div>

	<div class="margin-top-min">
		<Button @click="onProceedClick" icon="pi pi-forward" iconPos="left" label="Proceed" style="float:right"></Button>
	</div>

</template>

<style scoped>

</style>

<script lang="ts">


export default {
	methods: {
		onProceedClick: function(e: MouseEvent) {
			e.preventDefault();
		},		
	},
	mounted() {
		const canvas = new fabric.Canvas('canvas');

		fabric.Image.fromURL(`data:image/png;base64,${this.appState.image}`, function(img) {
			// img.set({ left: 0, top: 0});
			// img.selectable = false;
			// img.evented = false;
			// canvas.add(img);       
			canvas.setOverlayImage(img, () => {});
			const { height, width } = img;
			canvas.setDimensions({ height: `${height}`, width: `${width}`})
			canvas.renderAll();
		});
	}
}
</script>