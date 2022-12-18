<script setup lang="ts">
import debounce from 'debounce';

import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';

import AppState, { AppPage } from '../types/AppState'

defineProps({
	appState: {
		type: AppState,
		required: true,
	}
});
</script>

<template>
<div @paste="onPaste">
	<h1>Step 1. Select a template</h1>

	<div style="display: flex;">
		<div style="flex: 1 1;">
			<Card style="flex: 1 1">
				<template #title>
					Please provide a template image
				</template>
				<template #content>
					<div class="image-placeholder" @drop="onFileDrop" @dragover="onFileDragOver">
						<div>
							Please drag-and-drop an image here, press the <a href="#" @click="onBrowseClick">browse</a> button, or paste an image from clipboard (ctrl/cmd+V)
						</div>
					</div>

					<div class="margin-top-min">
						As an option, you can provide an image URL below:
						<InputText id="remoteUrl" type="text" class="margin-top-min" style="width: 100%" @keydown="onInputUpdate"
							placeholder="Examples: https://example.com/my/image.png; d:\images\my_image\png; /home/me/my_image.png"
							v-model="filePath" autofocus="true"/>
					</div>
				</template>
			</Card>
		</div>
		<div style="flex: 1 1; display: flex; margin-left: 1rem;">
			<Card style="display: flex; width: 100%;">
				<template #title>
					Preview
				</template>
				<template #content>
					<div v-if="state === State.Start">
						No preview available at this point.
					</div>
					<img v-if="state === State.Preview" v-bind:src="'data:image/png;base64, ' + fileContent" style="max-height: 300px;"/>
					<ProgressSpinner v-if="state === State.Loading" />
					<div v-if="state === State.Error">
						An error occurred. Please check the file path that you provided.
					</div>
				</template>
			</Card>
		</div>
	</div>

	<div class="margin-top-min">
		<Button @click="onProceedClick" icon="pi pi-forward" iconPos="left" label="Proceed" style="float:right" :disabled="!fileContent"></Button>
	</div>
</div>
</template>

<style scoped>

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

const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onload = () => resolve((reader.result || '').toString());
  reader.onerror = error => reject(error);
});

enum State {
	Start, // initial
	Loading, // loading an image
	Preview, // display a preview
	Error, // Failed to load an image
};

export default {
	methods: {
		loadImageFromPath: async function() {
			// Empty or no path separators found
			if ('' === this.filePath || (-1 === this.filePath.indexOf('/') && -1 === this.filePath.indexOf('\\'))) {
				return;
			}

			this.state = State.Loading;

			try {
				const content = await ipcRenderer.invoke("loadImageAsBase64", this.filePath);
				this.setContent(content);
			} catch {
				this.state = State.Error;
			}

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
				this.loadImageFromPath();
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
			this.loadImageFromPath();
		},
		onInputUpdate: debounce(function(this: any, e: Event) {
			this.loadImageFromPath();
		}, 1000),
		onPaste: async function() {
			const items = await navigator.clipboard.read();
			items.forEach(item => item.types.forEach(async type => {
				if (!type.startsWith("image/")) {
					return;
				}
				const imageBlob = await item.getType(type);
				let imageContent = await blobToBase64(imageBlob);
				if (imageContent.startsWith('data:')) {
					const pos = imageContent.search(',');
					imageContent = imageContent.substring(pos + 1);
				}
				this.setContent(imageContent);
			}));
		},
		onProceedClick: function(e: MouseEvent) {
			e.preventDefault();
			this.appState.image = this.fileContent || '';
			this.appState.page = AppPage.Edit;
		},
		setContent(content: string) {
			this.fileContent = content;
			this.state = State.Preview;
		}
	},
	data() {
		const result: {
			state: State,
			filePath: string,
			fileContent: string|null
		} = {
			state: State.Start,
			filePath: '',
			fileContent: null,
		}
		return result;
	}
}
</script>