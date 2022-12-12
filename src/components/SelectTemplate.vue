<script setup lang="ts">
import { ref, Ref } from 'vue'

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
				<InputText id="remoteUrl" type="text" class="margin-top-min" style="width: 100%"
					placeholder="Examples: https://example.com/my/image.png; d:\images\my_image\png; /home/me/my_image.png"
					v-model="filePath"/>
			</div>
		</template>

		<template #footer>
			<Button @click="onProceedClick" icon="pi pi-forward" iconPos="left" label="Proceed" style="float:right"></Button>
			<div style="clear: both"></div>
		</template>
	</Card>
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

let filePath: Ref<string> = ref("");

const onBrowseClick = (e: MouseEvent) => {
	e.preventDefault();
	ipcRenderer.invoke("openFile").then((e: Electron.OpenDialogReturnValue) => {
		if (e.canceled || 0 === e.filePaths.length) {
			return;
		}

		filePath.value = e.filePaths[0];
	});

};

const onFileDragOver  = (e: DragEvent) => {
	e.preventDefault();
};

const onFileDrop = (e: DragEvent) => {
	e.preventDefault();
	const files = (e.dataTransfer || {}).files || [];
	const file = files.length ? files[0] : null;
	if (!file) {
		return;
	}

	filePath.value = file.path;
};

export default {
	methods: {
		onProceedClick: function(e: MouseEvent) {
			e.preventDefault();
			this.appState.page = AppPage.Edit;
		}
	}
}
</script>