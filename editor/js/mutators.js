
Blockly.defineBlocksWithJsonArray([
    {
        type: "array_mutator_container",
        message0: "Array Items %1 %2",
        args0: [{ type: "input_dummy" }, { type: "input_statement", name: "STACK" }],
        colour: "#c03e3e"
    },
    ...[
        ["Any", "#b2bbcf"],
        ["Number", blockDefinitionMap.get("number").colour],
        ["Text", blockDefinitionMap.get("text").colour],
        ["Array", blockDefinitionMap.get("array").colour]
    ].map(([itemType, color]) => ({
        type: `array_mutator_item_${itemType.toLowerCase()}`,
        message0: `${itemType} %1`,
        args0: [
            {
                type: "field_number",
                name: "COUNT",
                value: 1,
                min: 1,
                precision: 1
            }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: color
    }))
])

function itemTypeFromBlockType(blockType) {
    const map = {
        array_mutator_item_any: "Any",
        array_mutator_item_number: "Number",
        array_mutator_item_text: "Text",
        array_mutator_item_array: "Array"
    }
    return map[blockType] || "Any"
}

function checkForItemType(type) {
    switch (type) {
        case "Number": return ["Number", "Any"]
        case "Text": return ["Text", "Any"]
        case "Array": return ["Array", "Any"]
        default: return null
    }
}

Blockly.Extensions.registerMutator("array_mutator", {
    itemTypes_: [],

    saveExtraState() {
        return { itemTypes: this.itemTypes_.slice() }
    },

    loadExtraState(state) {
        this.itemTypes_ = (state.itemTypes || []).slice()
        this.updateShape_()
    },

    decompose(workspace) {
        const containerBlock = workspace.newBlock("array_mutator_container")
        containerBlock.initSvg()

        let connection = containerBlock.getInput("STACK").connection
        for (const type of this.itemTypes_) {
            const itemBlock = workspace.newBlock(`array_mutator_item_${type.toLowerCase()}`)
            itemBlock.initSvg()
            itemBlock.setFieldValue("1", "COUNT")
            connection.connect(itemBlock.previousConnection)
            connection = itemBlock.nextConnection
        }
        return containerBlock
    },

    compose(containerBlock) {
        let itemBlock = containerBlock.getInputTargetBlock("STACK")
        const newTypes = []
        while (itemBlock) {
            const type = itemTypeFromBlockType(itemBlock.type)
            const count = parseInt(itemBlock.getFieldValue("COUNT"), 10) || 1
            for (let i = 0; i < count; i++) newTypes.push(type)
            itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
        }

        const oldConns = this.itemTypes_.map((_, i) => {
            const input = this.getInput("ITEM" + i)
            return input && input.connection.targetConnection
        })

        for (const conn of oldConns) {
            if (conn) conn.disconnect()
        }

        this.itemTypes_ = newTypes
        this.updateShape_()

        for (let i = 0; i < Math.min(oldConns.length, newTypes.length); i++) {
            if (!oldConns[i]) continue
            try {
                this.getInput("ITEM" + i).connection.connect(oldConns[i])
            } catch (e) {}
        }
    },

    saveConnections(containerBlock) {
        let itemBlock = containerBlock.getInputTargetBlock("STACK")
        let i = 0
        while (itemBlock) {
            const input = this.getInput("ITEM" + i)
            itemBlock.valueConnection_ = input && input.connection.targetConnection
            i++
            itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
        }
    },

    updateShape_() {
        if (this.itemTypes_.length && this.getInput("EMPTY")) this.removeInput("EMPTY")
        else if (!this.itemTypes_.length && !this.getInput("EMPTY")) this.appendDummyInput("EMPTY").appendField("Array")

        let i = 0
        for (; i < this.itemTypes_.length; i++) {
            let input = this.getInput("ITEM" + i)
            if (!input) {
                input = this.appendValueInput("ITEM" + i)
                if (i === 0) input.appendField("Array")
            }
            input.setCheck(checkForItemType(this.itemTypes_[i]))
        }
        while (this.getInput("ITEM" + i)) {
            this.removeInput("ITEM" + i)
            i++
        }
    }
}, undefined, [
    "array_mutator_item_any",
    "array_mutator_item_number",
    "array_mutator_item_text",
    "array_mutator_item_array"
])



Blockly.defineBlocksWithJsonArray([
    {
        type: "properties_mutator_container",
        message0: "Properties %1 %2",
        args0: [{ type: "input_dummy" }, { type: "input_statement", name: "STACK" }],
        colour: "#924f92"
    },
    {
        type: `properties_mutator_entry_field`,
        message0: `Property %1`,
        args0: [
            {
                type: "field_input",
                name: "NAME",
                text: "property"
            }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: "#bd53bd"
    }
])

Blockly.Extensions.registerMutator("properties_mutator", {
    entries_: [],

    saveExtraState() {
        return {
            entries: structuredClone(this.entries_)
        }
    },

    loadExtraState(state) {
        this.entries_ = state.entries ?? []
        this.updateShape_()
    },

    decompose(workspace) {
        const container = workspace.newBlock("properties_mutator_container")
        container.initSvg()

        let connection = container.getInput("STACK").connection

        for (const entry of this.entries_) {
            const item = workspace.newBlock("properties_mutator_entry_field")

            item.initSvg()
            item.setFieldValue(entry, "NAME")

            connection.connect(item.previousConnection)
            connection = item.nextConnection
        }

        return container
    },

    compose(containerBlock) {
        let itemBlock = containerBlock.getInputTargetBlock("STACK")
        const entries = []

        const oldConns = this.entries_.map((_, i) => {
            const input = this.getInput("VALUE" + i)
            return input && input.connection.targetConnection
        })

        for (const conn of oldConns) {
            conn?.disconnect()
        }

        while (itemBlock) {
            entries.push(itemBlock.getFieldValue("NAME"))
            itemBlock = itemBlock.nextConnection?.targetBlock()
        }

        this.entries_ = entries
        this.updateShape_()

        for (let i = 0; i < Math.min(oldConns.length, entries.length); i++) {
            if (!oldConns[i]) continue

            try {
                this.getInput("VALUE" + i).connection.connect(oldConns[i])
            } catch {}
        }
    },

    saveConnections(containerBlock) {
        let itemBlock = containerBlock.getInputTargetBlock("STACK")
        let i = 0

        while (itemBlock) {
            itemBlock.valueConnection_ =
                this.getInput("VALUE" + i)?.connection.targetConnection

            itemBlock = itemBlock.nextConnection?.targetBlock()
            i++
        }
    },

    updateShape_() {
        let i = 0

        while (this.getInput("VALUE" + i)) {
            this.removeInput("VALUE" + i)
            i++
        }

        if (!this.entries_.length) {
            if (!this.getInput("EMPTY")) {
                this.appendDummyInput("EMPTY")
            }
            return
        }

        if (this.getInput("EMPTY")) {
            this.removeInput("EMPTY")
        }

        for (let i = 0; i < this.entries_.length; i++) {
            this.appendValueInput("VALUE" + i)
                .appendField(this.entries_[i])
        }
    }
}, undefined, [
    "properties_mutator_entry_field"
])

Blockly.defineBlocksWithJsonArray([
    {
        type: "optional_default_mutator_container",
        message0: "Include Default %1",
        args0: [{ type: "field_checkbox", name: "DEFAULT", checked: false }],
        colour: "#554f92"
    }
])

Blockly.Extensions.registerMutator("optional_default_mutator", {
    hasDefault_: false,

    saveExtraState() {
        return { hasDefault: this.hasDefault_ }
    },

    loadExtraState(state) {
        this.hasDefault_ = !!state.hasDefault
        this.updateShape_()
    },

    decompose(workspace) {
        const containerBlock = workspace.newBlock("optional_default_mutator_container")
        containerBlock.initSvg()
        containerBlock.setFieldValue(this.hasDefault_ ? "TRUE" : "FALSE", "DEFAULT")
        return containerBlock
    },

    compose(containerBlock) {
        this.hasDefault_ = containerBlock.getFieldValue("DEFAULT") === "TRUE"
        this.updateShape_()
    },

    updateShape_() {
        const input = this.getInput("default")

        if (this.hasDefault_ && !input) {
            this.appendValueInput("default").appendField("Default Value")
        } else if (!this.hasDefault_ && input) {
            const targetBlock = input.connection && input.connection.targetBlock()
            if (targetBlock) targetBlock.dispose(true, true)
            this.removeInput("default")
        }
    }
})


Blockly.defineBlocksWithJsonArray([
    {
        type: "optional_min_max_properties_container",
        message0: "Include Min %1 Include Max %2",
        args0: [
            {
                type: "field_checkbox",
                name: "MIN",
                checked: false
            },
            {
                type: "field_checkbox",
                name: "MAX",
                checked: false
            }
        ],
        colour: "#554f92"
    }
])

Blockly.Extensions.registerMutator("optional_min_max_properties", {
    hasMin_: false,
    hasMax_: false,

    saveExtraState() {
        return {
            hasMin: this.hasMin_,
            hasMax: this.hasMax_
        }
    },

    loadExtraState(state) {
        this.hasMin_ = !!state.hasMin
        this.hasMax_ = !!state.hasMax
        this.updateShape_()
    },

    decompose(workspace) {
        const container = workspace.newBlock("optional_min_max_properties_container")
        container.initSvg()

        container.setFieldValue(this.hasMin_ ? "TRUE" : "FALSE", "MIN")
        container.setFieldValue(this.hasMax_ ? "TRUE" : "FALSE", "MAX")

        return container
    },

    compose(container) {
        this.hasMin_ = container.getFieldValue("MIN") === "TRUE"
        this.hasMax_ = container.getFieldValue("MAX") === "TRUE"

        this.updateShape_()
    },

    updateShape_() {
        const updateInput = (name, label, enabled) => {
            const input = this.getInput(name)

            if (enabled && !input) {
                this.appendValueInput(name)
                    .appendField(label)
            } else if (!enabled && input) {
                const target = input.connection?.targetBlock()
                if (target) {
                    target.dispose(true, true)
                }
                this.removeInput(name)
            }
        }

        updateInput("min", "Min", this.hasMin_)
        updateInput("max", "Max", this.hasMax_)
    }
})

Blockly.Blocks["explode_cherry_bomb_mutator_container"] = {
    init() {
        this.appendDummyInput()
            .appendField("Explosion Properties")

        this.appendStatementInput("STACK")

        this.setColour("#e33b3b")

        this.contextMenu = false
    }
}

const explodeOptions = [
    ["Color", "color", "Color"],
    ["Scale", "scale", "Vec2"],
    ["Explosion Width", "explosionWidth", "Number"],
    ["Explosion Height", "explosionHeight", "Number"],
    ["Explosion Lanes", "explosionLanes", "Array"],
    ["X Offset", "xOffset", "Number"],
    ["Y Offset", "yOffset", "Number"],
    ["Armor Protection", "armorProtection", "Boolean"],
    ["Armor Knock Sound", "armorKnockSound", "Boolean"],
    ["Body Knock Sound", "bodyKnockSound", "Boolean"],
    ["Damage Type", "damageType", "Text"],
    ["Screen Shake Duration", "screenShakeDuration", "Number"],
    ["Position Override", "positionOverride", "Vec3"],
    ["Play Sound", "playSound", "Boolean"],
    ["Show Explosion Text", "showExplosionText", "Boolean"],
    ["Zombie Callback", "zombieCallback", "_statement"],
]

const optionMap = Object.fromEntries(
    explodeOptions.map(([label, value, check]) => [
        value,
        { label, check }
    ])
)

Blockly.defineBlocksWithJsonArray(
    explodeOptions.map(([label, value]) => ({
        type: `explode_cherry_bomb_mutator_item_${value}`,
        message0: label,
        previousStatement: null,
        nextStatement: null,
        colour: "#e33b3b"
    }))
)

function explodeOptionFromBlockType(type) {
    return type.replace("explode_cherry_bomb_mutator_item_", "")
}

const explodeCherryBombMutator = {
    saveExtraState() {
        return {
            options: this.explodeOptions_
        }
    },

    loadExtraState(state) {
        this.explodeOptions_ = state.options ?? []
        this.updateShape_()
    },

    saveConnections(container) {
        let item = container.getInputTargetBlock("STACK")

        while (item) {
            const option = explodeOptionFromBlockType(item.type)
            const input = this.getInput(option)

            item.valueConnection_ = input?.connection.targetConnection

            item = item.nextConnection?.targetBlock()
        }
    },

    decompose(workspace) {
        const container = workspace.newBlock("explode_cherry_bomb_mutator_container")
        container.initSvg()

        let connection = container.getInput("STACK").connection

        for (const option of this.explodeOptions_) {
            const block = workspace.newBlock(
                `explode_cherry_bomb_mutator_item_${option}`
            )

            block.initSvg()

            connection.connect(block.previousConnection)
            connection = block.nextConnection
        }

        return container
    },

    compose(container) {
        const oldConnections = {}

        let item = container.getInputTargetBlock("STACK")
        while (item) {
            const option = explodeOptionFromBlockType(item.type)
            oldConnections[option] = item.valueConnection_
            item = item.nextConnection?.targetBlock()
        }

        this.explodeOptions_ = Object.keys(oldConnections)

        this.updateShape_()

        for (const [option, connection] of Object.entries(oldConnections)) {
            if (!connection) continue

            try {
                this.getInput(option)?.connection.connect(connection)
            } catch {}
        }
    },

    updateShape_() {
        for (const [input, {label, check}] of Object.entries(optionMap)) {
            if (this.explodeOptions_.includes(input)) {
                if (!this.getInput(input)) {
                    if (check === "_statement") {
                        this.appendStatementInput(input)
                            .appendField(label)
                    } else {
                        this.appendValueInput(input)
                            .setCheck(check ? [check, "Any"] : null)
                            .appendField(label)
                    }
                }
            } else {
                const existing = this.getInput(input)
                if (existing) {
                    if (check === "_statement") {
                        existing.connection.targetBlock()?.dispose(true, true)
                    } else {
                        existing.connection.targetBlock()?.dispose(true, true)
                    }
                    this.removeInput(input)
                }
            }
        }
    }
}

Blockly.Extensions.registerMutator(
    "explode_cherry_bomb_mutator",
    explodeCherryBombMutator,
    undefined,
    explodeOptions.map(
        ([, value]) => `explode_cherry_bomb_mutator_item_${value}`
    )
)

Blockly.defineBlocksWithJsonArray([
    {
        type: "optional_else_mutator_container",
        message0: "Include Else %1",
        args0: [
            {
                type: "field_checkbox",
                name: "ELSE",
                checked: true
            }
        ],
        colour: "#554f92"
    }
])

Blockly.Extensions.registerMutator("optional_else_mutator", {
    hasElse_: true,

    saveExtraState() {
        return {
            hasElse: this.hasElse_
        }
    },

    loadExtraState(state) {
        this.hasElse_ = state?.hasElse ?? true
        this.updateShape_()
    },

    decompose(workspace) {
        const container = workspace.newBlock("optional_else_mutator_container")
        container.initSvg()

        container.setFieldValue(
            this.hasElse_ ? "TRUE" : "FALSE",
            "ELSE"
        )

        return container
    },

    compose(container) {
        this.hasElse_ =
            container.getFieldValue("ELSE") === "TRUE"

        this.updateShape_()
    },

    updateShape_() {
        const input = this.getInput("else")

        if (this.hasElse_) {
            if (!input) {
                this.appendStatementInput("else")
                    .appendField("else")
            }
        } else if (input) {
            const connection = input.connection.targetConnection

            if (connection) {
                connection.disconnect()
                connection.getSourceBlock().bumpNeighbours()
            }

            this.removeInput("else")
        }
    }
})

Blockly.Extensions.registerMutator("optional_else_mutator_ternary", {
    hasElse_: true,

    saveExtraState() {
        return {
            hasElse: this.hasElse_
        }
    },

    loadExtraState(state) {
        this.hasElse_ = state?.hasElse ?? true
        this.updateShape_()
    },

    decompose(workspace) {
        const container = workspace.newBlock("optional_else_mutator_container")
        container.initSvg()

        container.setFieldValue(
            this.hasElse_ ? "TRUE" : "FALSE",
            "ELSE"
        )

        return container
    },

    compose(container) {
        this.hasElse_ =
            container.getFieldValue("ELSE") === "TRUE"

        this.updateShape_()
    },

    updateShape_() {
        const input = this.getInput("else")

        if (this.hasElse_) {
            if (!input) {
                this.appendValueInput("else")
                    .appendField("else")
            }
        } else if (input) {
            const connection = input.connection.targetConnection

            if (connection) {
                connection.disconnect()
                connection.getSourceBlock().bumpNeighbours()
            }

            this.removeInput("else")
        }
    }
})