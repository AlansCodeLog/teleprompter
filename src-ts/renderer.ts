import {remote} from "electron"
const { dialog } = remote

import fs from "fs"
import path from "path"


function calculate_counters(editor: HTMLTextAreaElement, counter_all: HTMLDivElement, wpm: HTMLInputElement, minutes: HTMLDivElement) {
	return function handler(e: Event) {
		let text = editor.value.replace(/(\[[\s\S]+\])/gm, "")
		let word_count = text.split(/\s+/gm).length
		counter_all.textContent = `${word_count}`
		let wpm_val = parseInt(wpm.value, 10)
		let read_time
		if (wpm_val == undefined) {
			read_time = "Invalid Input"
		} else {

			read_time = `${ms_to_time(Math.round((word_count / wpm_val) * 60 * 1000))}`
		}
		minutes.textContent = read_time
	}
}

document.addEventListener('DOMContentLoaded', () => {
	let wrapper = document.querySelector(".wrapper")! as HTMLTextAreaElement
	let editor = document.querySelector(".editor")! as HTMLTextAreaElement
	let menu = document.querySelector(".menu")! as HTMLDivElement
	let topbar = document.querySelector(".topbar")! as HTMLDivElement
	// let counter_part = document.querySelector(".counter-part")! as HTMLDivElement
	let counter_all = document.querySelector(".counter-all")! as HTMLDivElement
	let wpm = document.querySelector(".wpm")! as HTMLInputElement
	let minutes = document.querySelector(".minutes")! as HTMLDivElement
	let time = document.querySelector(".time")! as HTMLDivElement
	let time_val = document.querySelector(".time-val")! as HTMLDivElement
	let button_open = document.querySelector(".open")! as HTMLButtonElement
	let button_save = document.querySelector(".save")! as HTMLButtonElement
	let button_save_as = document.querySelector(".save-as")! as HTMLButtonElement
	let opacity_more = document.querySelector(".opacity-more")! as HTMLButtonElement
	let opacity_less = document.querySelector(".opacity-less")! as HTMLButtonElement
	let transparent_background = document.querySelector(".transparent-background")! as HTMLButtonElement

	menu.addEventListener("click", () => {
		let showing = topbar.style.display == "flex"
		if (showing) {
			topbar.style.display = "none"
			showing = false
		} else {
			topbar.style.display = "flex"
			showing = true
		}
	})


	const flex_handler = () => {
		let flexed = flex_detector(topbar, "row")

		if (flexed) {
			topbar.classList.add("wrapped")
		} else {
			topbar.classList.remove("wrapped")
		}
	}

	window.addEventListener("resize", flex_handler)

	flex_handler()


	let file: string

	button_open.addEventListener("click", (e) => {
		dialog.showOpenDialog({ properties: [ 'openFile' ] }, function (filename) {
			if (filename) {
				file = filename[0]

				fs.readFile(file, (err, contents) => {
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


	const handler = calculate_counters(editor, counter_all, wpm, minutes)

	editor.addEventListener("input", handler)

	let timer: undefined | Date

	let interval: NodeJS.Timeout

	time.addEventListener("click", () => {

		if (timer) {
			clearInterval(interval)
			time.textContent = "⏱️"
			timer = undefined
		} else {
			time.textContent = "🛑"
			timer = new Date()
			time_val.textContent = "00:00:00"
			interval = setInterval(() => {
				let finish = new Date()
				//@ts-ignore - Dates can be compared damn it.
				let elapsed = ms_to_time(finish - timer)

				time_val.textContent = `${elapsed}`
				console.log(elapsed);

			}, 100)
		}
	})


	const opacity_less_handler = () => {
		let el_opacity = getComputedStyle(wrapper).opacity
		let opacity = el_opacity === null || el_opacity === "" ? 0 : parseFloat(el_opacity)

		wrapper.style.opacity = opacity - 0.1 >= 0 ? `${opacity - 0.1}` : `0`
	}

	opacity_less.addEventListener("click", opacity_less_handler)

	const opacity_more_handler = () => {
		let el_opacity = getComputedStyle(wrapper).opacity
		let opacity = el_opacity === null || el_opacity === "" ? 0 : parseFloat(el_opacity)
		wrapper.style.opacity = opacity + 0.1 <= 1 ? `${opacity + 0.1}` : `1`
	}
	opacity_more.addEventListener("click", opacity_more_handler)


	let bg_state = 0.5

	const bg_state_toggler = () => {
		if (bg_state == 0.5) {
			wrapper.style.background = "rgba(0,0,0,1)"
			bg_state = 1
		} else {
			wrapper.style.background = "rgba(0,0,0,0.5)"
			bg_state = 0.5
		}
	}

	transparent_background.addEventListener("click", bg_state_toggler)

	window.addEventListener("keydown", (e) => {
		if (e.ctrlKey && e.altKey) {
			if (e.key == "-") {
				opacity_less_handler()
			} else if (e.key == "+" || e.key == "=") {
				opacity_more_handler()
			}
		}
		if (e.ctrlKey && !e.altKey && !e.shiftKey && e.key == "Tab") {
			bg_state_toggler()
		}
	})
})

function ms_to_time(ms: number) {
	let seconds = Math.floor((ms / 1000) % 60).toString()
	let minutes = Math.floor((ms / (1000 * 60)) % 60).toString()
	let hours = Math.floor((ms / (1000 * 60 * 60)) % 24).toString()

	return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`
}


function flex_detector(element: HTMLElement, row_or_column: "row" | "column" = "row") {
	let dir: { pos: "x" | "y", w_or_h: "width" | "height" } = { pos: "y", w_or_h: "height" }
	if (row_or_column == "column") {
		dir = { pos: "x", w_or_h: "width" }
	}

	let el = element

	let first = el.children[0].getBoundingClientRect() as { [key: string]: any }
	let last = el.children[el.children.length - 1].getBoundingClientRect() as {[key:string]: any}
	// should work even if the flex items are different heights
	// only exceptions i think are if the element aligns itself below another element somehow

	if (first[dir.pos] + first[dir.w_or_h] < last[dir.pos]) {
		return true
	} else {
		return false
	}
}
