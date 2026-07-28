class FieldMultilineJson extends FieldMultilineText {
    getDisplayText_() {
        try {
            return JSON.stringify(JSON5.parse(this.getValue()))
        } catch {
            return "Invalid Object"
        }
    }

    getEditorValue(value) {
        try {
            return JSON.stringify(JSON5.parse(value), null, 2)
        } catch {
            return value
        }
    }

    getStoredValue(value) {
        try {
            return JSON.stringify(JSON5.parse(value))
        } catch {
            return value
        }
    }
}

Blockly.fieldRegistry.register(
    "field_multiline_json",
    FieldMultilineJson
)