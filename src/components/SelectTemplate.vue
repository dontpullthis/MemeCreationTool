<script setup lang="ts">
import debounce from 'debounce';

import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';

import AppState, { AppPage } from '../types/AppState'
import SourceImage from '../types/SourceImage';

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
		<div class="main-block">
			<Card style="flex: 1 1; height: 100%">
				<template #title>
					Please provide a template image
				</template>
				<template #content>
					<div class="image-placeholder" @drop="onFileDrop" @dragover="onFileDragOver">
						<div>
							Please drag-and-drop an image here, press the <a href="#" @click="onBrowseClick">browse</a> button, or paste an image from clipboard (ctrl/cmd+V)
						</div>
					</div>

					<div class="margin-top-min" style="flex-basis: content;">
						As an option, you can provide an image URL below:
						<InputText id="remoteUrl" type="text" class="margin-top-min" style="width: 100%" @keydown="onInputUpdate"
							placeholder="Examples: https://example.com/my/image.png; d:\images\my_image\png; /home/me/my_image.png"
							v-model="image.path" autofocus="true"/>
					</div>
				</template>
			</Card>
		</div>
		<div style="display: flex; margin-left: 1rem;" class="main-block">
			<Card style="display: flex; width: 100%; height: 100%">
				<template #title>
					Preview
				</template>
				<template #content>
					<div v-if="state === State.Start">
						No preview available at this point.
					</div>
					<img v-if="state === State.Preview" v-bind:src="image.toDataUrl()" style="max-height: 300px;"/>
					<ProgressSpinner v-if="state === State.Loading" />
					<div v-if="state === State.Error">
						An error occurred. Please check the file path that you provided.
					</div>
				</template>
			</Card>
		</div>
	</div>

	<div class="margin-top-min">
		<Button @click="onProceedClick" icon="pi pi-forward" iconPos="left" label="Proceed" style="float:right" :disabled="!image.content"></Button>
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

.main-block {
	flex: 1 1;
	height: 400px;
}
</style>

<script lang="ts">
const { ipcRenderer } = require("electron");

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
			if (!this.image?.isPathUrlLike()) {
				return;
			}
			
			this.image.clearContent();
			this.state = State.Loading;
			try {
				await this.image.fromOwnPath();
				this.state = State.Preview;
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

					this.image.path = e.filePaths[0];
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
			this.image.path = file.path;
			this.loadImageFromPath();
		},
		onInputUpdate: debounce(function(this: any, e: Event) {
			this.loadImageFromPath();
		}, 500),
		onPaste: async function() {
			const items = await navigator.clipboard.read();
			items.forEach(item => item.types.forEach(async type => {
				if (!type.startsWith("image/")) {
					return;
				}
				const imageBlob = await item.getType(type);
				this.image = await SourceImage.fromBlob(imageBlob);
				this.state = State.Preview;
			}));
		},
		onProceedClick: function(e: MouseEvent) {
			e.preventDefault();
			this.appState.image = this.image;
			this.appState.page = AppPage.Edit;
		},
		setImage(image: SourceImage) {
			this.image = image;
			this.state = State.Preview;
		}
	},
	data() {
		const result: {
			image: SourceImage,
			state: State,
		} = {
			image: new SourceImage(),
			state: State.Start,
		}
		return result;
	}
}
</script>