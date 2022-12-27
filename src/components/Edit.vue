<script setup lang="ts">
import { fabric } from 'fabric';

import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';

import AppState from '../types/AppState'
import { isFontAvailable } from '../utils/fonts';

defineProps({
	appState: {
		type: AppState,
		required: true,
	}
});
</script>

<template>
	<h1>Step 2. Edit</h1>

	<Message v-if="displayImpactFontWarning" severity="warn">The <b>Impact</b> proprietary font was not detected in your system.
		It is recommended to install it for better experience.
		For now the appication will fall back to standard fonts.</Message>
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

const MAX_WIDTH_PX = 800;
const MAX_HEIGHT_PX = 600;

class Data {
	canvas?: fabric.Canvas = undefined
	displayImpactFontWarning: boolean = false
}

export default {
	methods: {
		onSaveClick(e: MouseEvent) {
			e.preventDefault();
		},
		onAddTextClick: function(e: MouseEvent) {
			e.preventDefault();
			const txt = new fabric.Textbox('NEW TEXT', {
				fill: 'white',
				left: (this.canvas?.width || 0) / 2,
				top: (this.canvas?.height || 0) / 2,
				editable: true,
				// Impact needs to be installed to system fonts
				fontFamily: "'Impact', Tahoma, Verdana, sans-serif",
				fontWeight: 'bold',
				stroke: 'black',
			});
			this.canvas?.add(txt);
		},
	},
	mounted() {
		this.displayImpactFontWarning = !isFontAvailable('16px Impact');

		this.canvas = new fabric.Canvas('canvas');
		this.canvas?.on("mouse:dblclick", (e: fabric.IEvent<MouseEvent>) => {
			const target = e.target;
			if (!target) {
				return;
			}

			if (target instanceof fabric.Textbox) {
				target.enterEditing();
			}
		});

		this.canvas.on('text:changed', function(opt) {
			const target = opt.target;
			if (!(target instanceof fabric.Textbox)) {
				return;
			}
			target.text = target.text?.toUpperCase();
		});

		const that = this;

		fabric.Image.fromURL(this.appState.image?.toDataUrl() || '', function(img) {
			if (!that.canvas) {
				return;
			}
			if (img.getScaledHeight() > MAX_HEIGHT_PX) {
				img.scaleToHeight(MAX_HEIGHT_PX);
			}
			if (img.getScaledWidth() > MAX_WIDTH_PX) {
				img.scaleToWidth(MAX_WIDTH_PX);
			}

			that.canvas.setDimensions({ height: img.getScaledHeight(), width: img.getScaledWidth()});

			img.set({ left: 0, top: 0 });
			img.selectable = false;
			img.evented = false;
			that.canvas.add(img);
		});
	},
	data() {
		return new Data();
	}
}
</script>