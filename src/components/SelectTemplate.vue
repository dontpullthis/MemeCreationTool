<script setup lang="ts">
import debounce from 'debounce';

import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';

import AppState, { AppPage } from '../types/AppState'

defineProps({
	appState: {
		type: AppState,
		required: true,
	}
});
</script>

<template>
	<h1>Step 1. Select a template</h1>

	<Card>
		<template #title>
			Please provide a template image
		</template>
		<template #content>
			<div class="image-placeholder" @drop="onFileDrop" @dragover="onFileDragOver">
				<div>
					Please drag-and-drop an image here or press the <a href="#" @click="onBrowseClick">browse</a> button
				</div>
			</div>
			
			<div class="margin-top-min">
				As an option, you can provide an image URL below:
				<InputText id="remoteUrl" type="text" class="margin-top-min" style="width: 100%" @keydown="onPathKeyDown" @paste="onPathKeyDown"
					placeholder="Examples: https://example.com/my/image.png; d:\images\my_image\png; /home/me/my_image.png"
					v-model="filePath"/>
			</div>
		</template>
	</Card>

	<Card>
		<template #title>
			Preview
		</template>
		<template #content>
			<div v-if="!fileContent">
				No preview available at this point.
			</div>
			<img v-if="fileContent" v-bind:src="'data:image/png;base64, ' + fileContent" />
		</template>
	</Card>

	<div class="margin-top-min">
		<Button @click="onProceedClick" icon="pi pi-forward" iconPos="left" label="Proceed" style="float:right" :disabled="!fileContent"></Button>
	</div>
</template>

<style scoped>
.margin-top-min {
	margin-top: 1rem;
}

.image-placeholder {
	border: 3px dashed gray;
	width: 100%;
	min-height: 10rem;
	display: flex;
	justify-content: center;
	align-content: center;
	flex-direction: column;
	text-align: center;
	padding: 1rem;
	
}
</style>

<script lang="ts">
const { ipcRenderer } = require("electron");

export default {
	methods: {
		loadImage: function() {
			ipcRenderer
				.invoke("loadImageAsBase64", this.filePath)
				.then(result => this.fileContent = result);
		},
		onBrowseClick: function(e: MouseEvent) {
			e.preventDefault();
			ipcRenderer
				.invoke("showOpenDialog")
				.then((e: Electron.OpenDialogReturnValue) => {
				if (e.canceled || 0 === e.filePaths.length) {
					return;
				}

				this.filePath = e.filePaths[0];
				this.loadImage();
			});

		},
		onFileDragOver: function(e: DragEvent) {
			e.preventDefault();
		},
		onFileDrop: function(e: DragEvent) {
			e.preventDefault();
			const files = (e.dataTransfer || {}).files || [];
			const file = files.length ? files[0] : null;
			if (!file) {
				return;
			}

			this.filePath = file.path;
		},
		onPathKeyDown: debounce(function(this: any, e: Event) {
			if (this.filePath !== '') {
				this.loadImage();
			}
		}, 500),
		onProceedClick: function(e: MouseEvent) {
			e.preventDefault();
			// this.appState.page = AppPage.Edit;
		},
	},
	data() {
		return {
			filePath: '',
			fileContent: null,
		}
	}
}
</script>