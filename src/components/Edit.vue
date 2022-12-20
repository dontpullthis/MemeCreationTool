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
					<Button @click="onAddTextClick" icon="pi pi-plus" iconPos="left" label="Add text" class="p-button-secondary"></Button>
				</template>
			</Card>
		</div>
	</div>

	<div class="margin-top-min">
		<Button @click="onSaveClick" icon="pi pi-save" iconPos="left" label="Save an image" style="float:right"></Button>
	</div>

</template>

<style scoped>

</style>

<script lang="ts">


export default {
	methods: {
		onSaveClick(e: MouseEvent) {
			e.preventDefault();
		},
		onAddTextClick: function(e: MouseEvent) {
			e.preventDefault();
			const txt = new fabric.Textbox('hello', {
				fill: 'white',
				left: 0,
				top: 0,
				editable: true,
				fontFamily: 'Impact',
				stroke: 'black',
			});
			this.canvas?.add(txt);
			txt.enterEditing();
		},
	},
	mounted() {
		this.canvas = new fabric.Canvas('canvas');
		const that = this;

		fabric.Image.fromURL(this.appState.image?.toDataUrl() || '', function(img) {
			if (!that.canvas) {
				return;
			}

			const { height, width } = img;
			that.canvas.setDimensions({ height: `${height}`, width: `${width}`});

			img.set({ left: 0, top: 0 });
			img.selectable = false;
			img.evented = false;
			that.canvas.add(img);
		});
	},
	data() {
		const d: {
			canvas: fabric.Canvas | null,
		} = {
			canvas: null,
		}

		return d;
	}
}
</script>