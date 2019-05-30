const { dialog } = require('electron').remote

const fs = require('fs')
const path = require("path")

document.addEventListener('DOMContentLoaded', () => {
	let editor = document.querySelector(".editor")
	let button_open = document.querySelector(".open")
	let button_save = document.querySelector(".save")
	let button_save_as = document.querySelector(".save-as")
	let file

	button_open.addEventListener("click", (e) => {
		dialog.showOpenDialog({ properties: [ 'openFile' ] }, function (filename) {
			if (filename) {
				filename = filename[0]
				file = filename

				fs.readFile(filename, (err, contents) => {
					editor.value = contents.toString()
				})
			}
		});
	})
	button_save.addEventListener("click", (e) => {
		fs.writeFile(file, editor.value, (err) => {
			if (err) {
				console.log(err)
			}
		})
	})
	button_save_as.addEventListener("click", (e) => {
		dialog.showSaveDialog({ defaultPath: file }, function (filename) {
			if (filename) {
				file = filename
				fs.writeFile(file, editor.value, (err) => {
					console.log(err)
				})
			}
		});
	})
});
