
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

function createToggleInputMutator(
    {
        id,
        colour,
        title,
        inputs
    }
) {
    Blockly.defineBlocksWithJsonArray([{
        type: `${id}_container`,
        message0: title,
        args0: inputs.map(input => ({
            type: "field_checkbox",
            name: input.id,
            checked: !!input.default
        })),
        colour
    }])

    Blockly.Extensions.registerMutator(`${id}_mutator`, {
        saveExtraState() {
            const state = {}

            for (const input of inputs) {
                state[input.id] = !!this[input.id]
            }

            return state
        },

        loadExtraState(state) {
            for (const input of inputs) {
                this[input.id] = !!state[input.id]
            }

            this.updateShape_()
        },

        decompose(workspace) {
            const container = workspace.newBlock(`${id}_container`)
            container.initSvg()

            for (const input of inputs) {
                container.setFieldValue(
                    this[input.id] ? "TRUE" : "FALSE",
                    input.id
                )
            }

            return container
        },

        compose(container) {
            for (const input of inputs) {
                this[input.id] =
                    container.getFieldValue(input.id) === "TRUE"
            }

            this.updateShape_()
        },

        updateShape_() {
            for (const config of inputs) {
                const input = this.getInput(config.id)

                if (this[config.id]) {
                    if (!input) {
                        config.create(this)
                    }
                } else if (input) {
                    const connection = input.connection?.targetConnection

                    if (connection) {
                        connection.disconnect()
                        connection.getSourceBlock().bumpNeighbours()
                    }

                    this.removeInput(config.id)
                }
            }
        }
    })
}

function createOptionalInputMutator(
    {
        id,
        colour,
        title,
        options
    }
) {
    Blockly.Blocks[`${id}_mutator_container`] = {
        init() {
            this.appendDummyInput()
                .appendField(title)

            this.appendStatementInput("STACK")

            this.setColour(colour)
            this.contextMenu = false
        }
    }

    Blockly.defineBlocksWithJsonArray(
        options.map(option => ({
            type: `${id}_mutator_item_${option.id}`,
            message0: option.label,
            previousStatement: null,
            nextStatement: null,
            colour
        }))
    )

    function optionFromBlockType(type) {
        return type.substring(`${id}_mutator_item_`.length)
    }

    const mutator = {
        saveExtraState() {
            return {
                options: this.optionalInputs_ ?? []
            }
        },

        loadExtraState(state) {
            this.optionalInputs_ = state.options ?? []
            this.updateShape_()
        },

        saveConnections(container) {
            let item = container.getInputTargetBlock("STACK")

            while (item) {
                const option = optionFromBlockType(item.type)
                const input = this.getInput(option)

                item.valueConnection_ = input?.connection?.targetConnection

                item = item.nextConnection?.targetBlock()
            }
        },

        decompose(workspace) {
            this.optionalInputs_ ??= []

            const container = workspace.newBlock(`${id}_mutator_container`)
            container.initSvg()

            let connection = container.getInput("STACK").connection

            for (const option of this.optionalInputs_) {
                try {
                    const block = workspace.newBlock(`${id}_mutator_item_${option}`)
                    block.initSvg()

                    connection.connect(block.previousConnection)
                    connection = block.nextConnection
                } catch (e) {}
            }

            return container
        },

        compose(container) {
            const connections = {}
            let item = container.getInputTargetBlock("STACK")

            while (item) {
                const option = optionFromBlockType(item.type)
                connections[option] = item.valueConnection_
                item = item.nextConnection?.targetBlock()
            }

            this.optionalInputs_ = Object.keys(connections)

            this.updateShape_()

            for (const [option, connection] of Object.entries(connections)) {
                if (!connection) continue

                try {
                    this.getInput(option)?.connection?.connect(connection)
                } catch {}
            }
        },

        updateShape_() {
            for (const option of options) {
                if (this.optionalInputs_.includes(option.id)) {
                    if (!this.getInput(option.id)) {
                        option.create(this)
                    }
                } else {
                    const input = this.getInput(option.id)
                    if (!input) continue

                    input.connection?.targetBlock()?.dispose(true, true)
                    this.removeInput(option.id)
                }
            }
        },

        setOptionalInputs_(data) {
            this.optionalInputs_ = options
                .filter(option => data[option.id] !== undefined)
                .map(option => option.id)

            this.updateShape_()
        }
    }

    Blockly.Extensions.registerMutator(
        `${id}_mutator`,
        mutator,
        undefined,
        options.map(option => `${id}_mutator_item_${option.id}`)
    )
}

function createValueInput(id, label, check) {
    return {
        id: id,
        label,
        create(block) {
            block.appendValueInput(this.id)
                .setCheck([check, "Any"])
                .appendField(label)
        }
    }
}

function createDropdownInput(id, label, options) {
    return {
        id: id,
        label,
        create(block) {
            block.appendDummyInput(this.id)
                .appendField(label)
                .appendField(
                    new Blockly.FieldDropdown(options),
                    this.id
                )
        }
    }
}

function createStatementInput(id, label) {
    return {
        id,
        label,
        create(block) {
            block.appendStatementInput(this.id)
                .appendField(label)
        }
    }
}

createToggleInputMutator({
    id: "optional_default",
    colour: "#554f92",
    title: "Include Default Value %1",
    inputs: [
        createValueInput("default", "Default Value", null)
    ]
})

createToggleInputMutator({
    id: "optional_min_max",
    colour: "#554f92",
    title: "Include Min %1 Max %2",
    inputs: [
        createValueInput("min", "Min", null),
        createValueInput("max", "Max", null)
    ]
})

createToggleInputMutator({
    id: "optional_else_statement",
    colour: "#554f92",
    title: "Include Else %1",
    inputs: [
        createStatementInput("else", "else")
    ]
})

createToggleInputMutator({
    id: "optional_else_expression",
    colour: "#554f92",
    title: "Include Else %1",
    inputs: [
        createValueInput("else", "else", null)
    ]
})

const explodeOptions = [
    createValueInput("color", "Color", "Color"),
    createValueInput("scale", "Scale", "Vec2"),
    createValueInput("explosionWidth", "Explosion Width", "Number"),
    createValueInput("explosionHeight", "Explosion Height", "Number"),
    createValueInput("explosionLanes", "Explosion Lanes", "Array"),
    createValueInput("xOffset", "X Offset", "Number"),
    createValueInput("yOffset", "Y Offset", "Number"),
    createValueInput("armorProtection", "Armor Protection", "Boolean"),
    createValueInput("armorKnockSound", "Armor Knock Sound", "Boolean"),
    createValueInput("bodyKnockSound", "Body Knock Sound", "Boolean"),
    createDropdownInput("damageType", "Damage Type", BlocklyConstants.DropDownOptions.DamageType),
    createValueInput("screenShakeDuration", "Screen Shake Duration", "Number"),
    createValueInput("positionOverride", "Position Override", "Vec3"),
    createValueInput("playSound", "Play Sound", "Boolean"),
    createValueInput("showExplosionText", "Show Explosion Text", "Boolean"),
    createStatementInput("zombieCallback", "Zombie Callback")
]

createOptionalInputMutator({
    id: "explode_cherry_bomb",
    title: "Explosion Properties",
    colour: "#e33b3b",
    options: explodeOptions
})

const jalapenoLaneFireOptions = [
    createValueInput("armorProtection", "Armor Protection", "Boolean"),
    createValueInput("height", "Fire Height", "Number"),
    createDropdownInput("color", "Color", BlocklyConstants.DropDownOptions.JalapenoFireColor),
    createDropdownInput("spreadStyle", "Spread Pattern", BlocklyConstants.DropDownOptions.JalapenoSpreadPattern),
    createValueInput("spreadSpeed", "Spread Speed", "Number"),
    createValueInput("zombieWhitelist", "Zombie Whitelist", "Array"),
    createValueInput("hypnoIncluded", "Include Hypno", "Boolean"),
    createValueInput("plantsIncluded", "Include Plants", "Boolean"),
    createValueInput("isDPS", "Is DPS", "Boolean"),
    createValueInput("burnsFlying", "Burn Flying", "Boolean"),
    createValueInput("parentObject", "Parent Object", null)
]

createOptionalInputMutator({
    id: "jalapeno_lane_fire",
    title: "Jalapeno Fire Properties",
    colour: "#d64b35",
    options: jalapenoLaneFireOptions
})