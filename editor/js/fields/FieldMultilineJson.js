class FieldMultilineJson extends Blockly.FieldTextInput {
    getDisplayText_() {
        try {
            return JSON.stringify(
                JSON5.parse(this.getValue())
            )
        } catch (e) {
            return "Invalid Object"
        }
    }
    showEditor_() {
        const textarea = document.createElement("textarea")
        textarea.className = "jsonEditor"

        textarea.value = this.getValue()

        try {
            textarea.value = JSON.stringify(
                JSON5.parse(textarea.value),
                null,
                2
            )
        } catch (e) {}

        textarea.addEventListener("keydown", e => {
            e.stopPropagation()

            if (e.key !== "Tab") return

            e.preventDefault()

            const oldStart = textarea.selectionStart
            const oldEnd = textarea.selectionEnd

            const lineStart = textarea.value.lastIndexOf("\n", oldStart - 1) + 1

            let editStart = lineStart
            let editEnd = oldEnd

            if (editEnd < textarea.value.length &&
                textarea.value[editEnd] !== "\n") {
                const nextLine = textarea.value.indexOf("\n", editEnd)

                editEnd = nextLine === -1
                    ? textarea.value.length
                    : nextLine
            }

            const selectedText = textarea.value.substring(editStart, editEnd)
            const lines = selectedText.split("\n")

            let removedBeforeStart = 0
            let removedBeforeEnd = 0

            if (e.shiftKey) {
                let offset = 0

                for (let line of lines) {
                    const remove = Math.min(
                        line.match(/^ */)?.[0].length ?? 0,
                        2
                    )

                    if (offset + remove <= oldStart - editStart) {
                        removedBeforeStart += remove
                    }

                    if (offset + remove <= oldEnd - editStart) {
                        removedBeforeEnd += remove
                    }

                    offset += line.length + 1

                    line = line.substring(remove)
                }

                for (let i = 0; i < lines.length; i++) {
                    lines[i] = lines[i].replace(/^ {1,2}/, "")
                }
            } else {
                for (let i = 0; i < lines.length; i++) {
                    lines[i] = "  " + lines[i]
                }
            }

            const newText = lines.join("\n")

            textarea.value =
                textarea.value.substring(0, editStart) +
                newText +
                textarea.value.substring(editEnd)

            if (e.shiftKey) {
                textarea.selectionStart = oldStart - removedBeforeStart
                textarea.selectionEnd = oldEnd - removedBeforeEnd
            } else {
                textarea.selectionStart = oldStart + 2
                textarea.selectionEnd = oldEnd + lines.length * 2
            }
        })

        textarea.addEventListener("change", () => {
            try {
                this.setValue(
                    JSON.stringify(
                        JSON5.parse(textarea.value)
                    )
                )
            } catch (e) {
                this.setValue(textarea.value)
            }

            Blockly.DropDownDiv.hide()
        })

        Blockly.DropDownDiv.clearContent()

        const content = Blockly.DropDownDiv.getContentDiv()

        content.style.width = "auto"
        content.style.height = "auto"
        content.style.overflow = "visible"

        content.appendChild(textarea)

        Blockly.DropDownDiv.showPositionedByField(this)

        const observer = new ResizeObserver(() => {
            const content = Blockly.DropDownDiv.getContentDiv()
            const rect = textarea.getBoundingClientRect()

            content.style.width = `${rect.width}px`
            content.style.height = `${rect.height}px`

            Blockly.DropDownDiv.repositionForWindowResize()
        })

        observer.observe(textarea)

        textarea.focus()
    }
}

Blockly.fieldRegistry.register(
    "field_multiline_json",
    FieldMultilineJson
)