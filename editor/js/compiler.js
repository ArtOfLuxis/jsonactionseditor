
function isNotNull(value) {
    return value !== null && value !== undefined
}

const output = document.querySelector("#output code")

let shouldOptimize = false
let inlineVariables = new Map()

document.getElementById("compileBtn").onclick = () => {
    inlineVariables = new Map()

    const shouldClearLog = document.getElementById("clearLogCheckbox").checked
    if (shouldClearLog) clearLog()
    const shouldSave = document.getElementById("saveCheckbox").checked
    if (shouldSave) saveProject()

    shouldOptimize = document.getElementById("optimizeCheckbox").checked
    logger(
        shouldOptimize ? "Compiling..." : "Compiling without optimizations...",
        "info"
    )

    try {
        const start = performance.now()

        const json = compileWorkspaceChains(currentPage)

        const time = ((performance.now() - start) / 1000).toFixed(3)

        const formatted = JSON.stringify(json, null, 2)

        pageOutputs.set(currentPage, formatted)

        output.textContent = formatted
        Prism.highlightElement(output)

        logger(`Compiled successfully in ${time}s`, "success")
    }
    catch (e) {
        logger(`Error encountered: ${e}`, "error")
    }
}

function removeJSONActionNulls(value) {
    if (value === null || typeof value !== "object") return

    if (Array.isArray(value)) {
        for (const item of value) {
            removeJSONActionNulls(item)
        }
        return
    }

    const isActionNode = "kind" in value
    const blacklistNullFields = ["value"]

    for (const [key, val] of Object.entries(value)) {
        if (val === null) {
            if (isActionNode && !blacklistNullFields.includes(key))
                delete value[key]
        } else {
            removeJSONActionNulls(val)
        }
    }
}

function compressActions(actions) {
    const result = []

    for (const action of actions) {
        const last = result[result.length - 1]

        if (
            shouldOptimize &&
            last &&
            action &&
            last.kind === "SetObjectProperties" &&
            (
                (action.kind === "SetObjectProperty" && typeof action.property === "string") ||
                action.kind === "SetObjectProperties"
            ) &&
            JSON.stringify(last.object) === JSON.stringify(action.object)
        ) {
            if (action.kind === "SetObjectProperty") {
                last.properties[action.property] = action.value
            } else {
                Object.assign(last.properties, action.properties)
            }
        } else if (
            shouldOptimize &&
            last &&
            action &&
            (last.kind === "SetObjectProperty" && typeof last.property === "string") &&
            (
                (action.kind === "SetObjectProperty" && typeof action.property === "string") ||
                action.kind === "SetObjectProperties"
            ) &&
            JSON.stringify(last.object) === JSON.stringify(action.object)
        ) {
            result[result.length - 1] = {
                kind: "SetObjectProperties",
                object: last.object,
                properties: {
                    [last.property]: last.value,
                    ...(action.kind === "SetObjectProperty"
                        ? { [action.property]: action.value }
                        : action.properties)
                }
            }
        } else {
            result.push(action)
        }

        if (shouldOptimize) {
            removeJSONActionNulls(action)
        }
    }

    return result
}

function compileWorkspaceChains(workspace) {
    const chains = {}

    const topBlocks = workspace.getTopBlocks(true)

    const pushAction = (action, actionsList) => {
        if (Array.isArray(action)) {
            action.forEach(item => pushAction(item, actionsList))
        } else if (action?.kind) {
            actionsList.push(action)
        }
    }

    let found = false
    for (const topBlock of topBlocks) {
        if (topBlock.type !== "start_block" || !topBlock.isEnabled()) {
            continue
        }

        const name = topBlock.getFieldValue("name")?.trim()

        if (!name) {
            logger("Found Start block with no name.", "warn")
            continue
        }

        found = true

        if (chains[name]) {
            logger(`Duplicate Start block "${name}".`, "warn")
        }

        let chain = []
        let block = topBlock.getNextBlock()

        while (block) {
            if (block.isEnabled()) {
                pushAction(compile(block), chain)
            }

            block = block.getNextBlock()
        }

        chains[name] = compressActions(chain)
    }

    if (!found) logger("Couldn't find a valid Start block", "error")

    return chains
}

function compile(block) {
    try {
        if (block === null || block === undefined || !block.isEnabled()) {
            return null
        }
        switch (block.type) {
            // Flow
            case "sleep": {
                return {
                    kind: "Sleep",
                    object: withObjectDefault(compile(block.getInputTargetBlock("object"))),
                    cloneContext: block.getFieldValue("cloneContext") === "TRUE",
                    time: compile(block.getInputTargetBlock("time")),
                    actions: compileStatementList(block.getInputTargetBlock("actions")),
                }
            }


            // Loops
            case "for_loop": {
                return {
                    kind: "For",
                    variable: compile(block.getInputTargetBlock("variable")),
                    iterable: compile(block.getInputTargetBlock("iterable")),
                    actions: compileStatementList(block.getInputTargetBlock("actions")),
                }
            }


            // Logic
            case "if_statement": {
                const condition = compile(block.getInputTargetBlock("condition"))

                if (shouldOptimize && typeof condition === "boolean") {
                    return compileStatementList(
                        block.getInputTargetBlock(condition ? "then" : "else")
                    )
                }

                return {
                    kind: "If",
                    condition,
                    then: compileStatementList(block.getInputTargetBlock("then")),
                    else: compileStatementList(block.getInputTargetBlock("else"))
                }
            }
            case "ternary_expression": {
                const condition = compile(block.getInputTargetBlock("condition"))

                if (shouldOptimize && typeof condition === "boolean") {
                    return compile(
                        block.getInputTargetBlock(condition ? "then" : "else")
                    )
                }

                const thenValue = compile(block.getInputTargetBlock("then"))
                const elseValue = compile(block.getInputTargetBlock("else"))

                if (shouldOptimize && thenValue === elseValue) {
                    return thenValue
                }

                return {
                    kind: "Ternary",
                    condition,
                    then: compile(block.getInputTargetBlock("then")),
                    else: compile(block.getInputTargetBlock("else"))
                }
            }
            case "logic_operation": {
                const left = compile(block.getInputTargetBlock("left"))
                const operator = block.getFieldValue("operator")
                const right = compile(block.getInputTargetBlock("right"))

                if (operator === "||" && (left === true || right === true)) {
                    return true
                }

                if (shouldOptimize && typeof left === "boolean" && typeof right === "boolean") {
                    switch (operator) {
                        case "&&":
                            return left && right
                    }
                }

                return {
                    left,
                    kind: operator,
                    right
                }
            }
            case "logic_equality_operation": {
                const left = compile(block.getInputTargetBlock("left"))
                const operator = block.getFieldValue("operator")
                const right = compile(block.getInputTargetBlock("right"))

                const allEqualityTypes = ["boolean", "string", "number"]
                if (shouldOptimize && allEqualityTypes.includes(typeof left) && allEqualityTypes.includes(typeof right)) {
                    switch (operator) {
                        case "==":
                            return left === right
                        case "!=":
                            return left !== right
                    }
                }

                const numberEqualityTypes = ["number"]
                if (shouldOptimize && numberEqualityTypes.includes(typeof left) && numberEqualityTypes.includes(typeof right)) {
                    switch (operator) {
                        case ">":
                            return left > right
                        case ">=":
                            return left >= right
                        case "<":
                            return left < right
                        case "<=":
                            return left <= right
                    }
                }

                return {
                    left,
                    kind: operator,
                    right
                }
            }
            case "logic_not": {
                const value = compile(block.getInputTargetBlock("value"))

                if (typeof value === "boolean") {
                    return !value
                }

                return {
                    kind: "not",
                    value,
                }
            }
            case "logic_random_chance": {
                return {
                    kind: "MathRandomChance",
                    chance: compile(block.getInputTargetBlock("chance")),
                }
            }


            // Math
            case "math_operation": {
                const left = compile(block.getInputTargetBlock("left"))
                const operator = block.getFieldValue("operator")
                const right = compile(block.getInputTargetBlock("right"))

                if (shouldOptimize && typeof left === "number" && typeof right === "number") {
                    switch (operator) {
                        case "+":
                            return left + right
                        case "-":
                            return left - right
                        case "*":
                            return left * right
                        case "**":
                            return Math.pow(
                                left,
                                right
                            )
                        case "/":
                            return left / right
                        case "//":
                            return Math.floor(
                                left / right
                            )
                        case "%":
                            return left % right
                    }
                }

                return {
                    left,
                    kind: operator,
                    right
                }
            }

            case "math_random": {
                return {
                    kind: "MathRandomRange",
                    min: compile(block.getInputTargetBlock("min")),
                    max: compile(block.getInputTargetBlock("max")),
                }
            }


            // Variables
            case "define_inline_variable": {
                const variableName = block.getFieldValue("name")

                if (variableName in inlineVariables) {
                    logger(`Inline variable ${variableName} redefined, this is usually unwanted behavior`, "warn")
                }

                inlineVariables.set(
                    variableName,
                    compile(block.getInputTargetBlock("value"))
                )

                return null
            }
            case "inline_variable": {
                const variableName = block.getFieldValue("name")

                if (!inlineVariables.has(variableName)) {
                    logger(`Undefined inline variable: ${variableName}`, "error")
                    return null
                }

                return inlineVariables.get(variableName)
            }
            case "define_context_variable": {
                const variableName = block.getFieldValue("name")

                return {
                    kind: "SetContextObject",
                    name: variableName,
                    object: compile(block.getInputTargetBlock("object"))
                }
            }
            case "context_variable": {
                const variableName = block.getFieldValue("name")
                const defaultValue = compile(block.getInputTargetBlock("default"))

                return {
                    kind: "GetContextObject",
                    name: variableName,
                    default: defaultValue
                }
            }
            case "get_context_object": {
                const variableName = compile(block.getInputTargetBlock("name"))
                const defaultValue = compile(block.getInputTargetBlock("default"))

                return {
                    kind: "GetContextObject",
                    name: variableName,
                    default: defaultValue
                }
            }
            case "context": {
                return {
                    kind: "GetContext"
                }
            }
            case "context_target": {
                return {
                    kind: "GetContextObject",
                    name: "target"
                }
            }
            case "context_source": {
                return {
                    kind: "GetContextObject",
                    name: "source"
                }
            }


            // Properties
            case "set_object_property": {
                const object = compile(block.getInputTargetBlock("object"))
                const property = compile(block.getInputTargetBlock("property"))
                const value = compile(block.getInputTargetBlock("value"))

                return {
                    kind: "SetObjectProperty",
                    object,
                    property,
                    value
                }
            }
            case "set_object_properties": {
                const object = compile(block.getInputTargetBlock("object"))

                const properties = {}

                for (let i = 0; i < block.entries_.length; i++) {
                    const key = block.entries_[i]
                    properties[key] = compile(block.getInputTargetBlock("VALUE" + i))
                }

                return {
                    kind: "SetObjectProperties",
                    object,
                    properties
                }
            }
            case "modify_object_property": {
                const object = compile(block.getInputTargetBlock("object"))
                const property = compile(block.getInputTargetBlock("property"))
                const operator = block.getFieldValue("operator")
                const value = compile(block.getInputTargetBlock("value"))
                const min = compile(block.getInputTargetBlock("min"))
                const max = compile(block.getInputTargetBlock("max"))

                return {
                    kind: "ModifyObjectProperty",
                    object,
                    property,
                    operator,
                    value,
                    min,
                    max
                }
            }
            case "get_object_property": {
                const object = compile(block.getInputTargetBlock("object"))
                const property = compile(block.getInputTargetBlock("property"))
                const defaultValue = compile(block.getInputTargetBlock("default"))

                return {
                    kind: "GetObjectProperty",
                    object,
                    property,
                    default: defaultValue
                }
            }


            // Zombies
            case "deal_damage_zombie": {
                const zombie = compile(block.getInputTargetBlock("zombie"))
                const damageDetails = compile(block.getInputTargetBlock("damageDetails"))

                return {
                    kind: "DealDamageZombie",
                    zombie,
                    damageDetails
                }
            }


            // Plants
            case "deal_damage_plant": {
                const plant = compile(block.getInputTargetBlock("plant"))
                const damage = compile(block.getInputTargetBlock("damage"))

                return {
                    kind: "DealDamagePlant",
                    plant,
                    damage
                }
            }

            case "explode_cherry_bomb": {
                const showExplosionText = block.getFieldValue("showExplosionText")
                return {
                    kind: "ExplodeCherryBomb",
                    lnc: compile(block.getInputTargetBlock("lnc")),
                    damage: compile(block.getInputTargetBlock("damage")),
                    showExplosionText: showExplosionText ? showExplosionText === "TRUE" : null,
                    color: compile(block.getInputTargetBlock("color")),
                    scale: compile(block.getInputTargetBlock("scale")),
                    explosionWidth: compile(block.getInputTargetBlock("explosionWidth")),
                    explosionHeight: compile(block.getInputTargetBlock("explosionHeight")),
                    explosionLanes: compile(block.getInputTargetBlock("explosionLanes")),
                    xOffset: compile(block.getInputTargetBlock("xOffset")),
                    yOffset: compile(block.getInputTargetBlock("yOffset")),
                    armorProtection: compile(block.getInputTargetBlock("armorProtection")),
                    armorKnockSound: compile(block.getInputTargetBlock("armorKnockSound")),
                    bodyKnockSound: compile(block.getInputTargetBlock("bodyKnockSound")),
                    damageType: compile(block.getInputTargetBlock("damageType")),
                    screenShakeDuration: compile(block.getInputTargetBlock("screenShakeDuration")),
                    positionOverride: compile(block.getInputTargetBlock("positionOverride")),
                    playSound: compile(block.getInputTargetBlock("playSound")),
                    zombieCallback: compileStatementList(block.getInputTargetBlock("zombieCallback"))
                }
            }
            case "spawn_lane_fire": {
                return {
                    kind: "SpawnLaneFire",
                    lnc: compile(block.getInputTargetBlock("lnc")),
                    damage: compile(block.getInputTargetBlock("damage")),
                    armorProtection: compile(block.getInputTargetBlock("armorProtection")),
                    duration: compile(block.getInputTargetBlock("duration")),
                    height: compile(block.getInputTargetBlock("height")),
                    color: block.getFieldValue("color"),
                    spreadStyle: block.getFieldValue("spreadStyle"),
                    spreadSpeed: compile(block.getInputTargetBlock("spreadSpeed")),
                    spreadDistance: compile(block.getInputTargetBlock("spreadDistance")),
                    zombieWhitelist: compile(block.getInputTargetBlock("zombieWhitelist")),
                    hypnoIncluded: compile(block.getInputTargetBlock("hypnoIncluded")),
                    plantsIncluded: compile(block.getInputTargetBlock("plantsIncluded")),
                    isDPS: compile(block.getInputTargetBlock("isDPS")),
                    burnsFlying: compile(block.getInputTargetBlock("burnsFlying")),
                    parentObject: compile(block.getInputTargetBlock("parentObject"))
                }
            }


            // Hitboxes
            case "rectangle_intersects_rectangle": {
                const rectangle1 = compile(block.getInputTargetBlock("rectangle1"))
                const rectangle2 = compile(block.getInputTargetBlock("rectangle2"))

                return {
                    kind: "RectangleIntersectsRectangle",
                    rectangle1,
                    rectangle2
                }
            }
            case "zombie_body_rectangle":
                return {
                    kind: "ZombieBodyRectangle",
                    zombie: compile(block.getInputTargetBlock("zombie")),
                    rectangleForProjectiles: compile(
                        block.getInputTargetBlock("rectangleForProjectiles")
                    )
                }
            case "plant_body_rectangle":
                return {
                    kind: "PlantBodyRectangle",
                    plant: compile(block.getInputTargetBlock("plant"))
                }
            case "projectile_body_rectangle":
                return {
                    kind: "ProjectileBodyRectangle",
                    projectile: compile(block.getInputTargetBlock("projectile"))
                }


            // Lawn
            case "lawn_object_pool": {
                const objectType = block.getFieldValue("objectType")

                return {
                    kind: `Get${objectType}PoolArray`
                }
            }
            case "lane_object_pool": {
                const objectType = block.getFieldValue("objectType")

                return {
                    kind: `GetLane${objectType}PoolArray`,
                    lane: compile(block.getInputTargetBlock("lane"))
                }
            }
            case "get_lane": {
                return {
                    kind: "GetLane",
                    lane: compile(block.getInputTargetBlock("lane"))
                }
            }
            case "lane_index": {
                return {
                    kind: "GetLaneIndex",
                    lane: compile(block.getInputTargetBlock("lane"))
                }
            }
            case "upper_lane": {
                return {
                    kind: "GetUpperLane",
                    lane: compile(block.getInputTargetBlock("lane"))
                }
            }
            case "lower_lane": {
                return {
                    kind: "GetLowerLane",
                    lane: compile(block.getInputTargetBlock("lane"))
                }
            }

            case "get_object_lane": {
                return {
                    kind: "GetObjectLane",
                    object: compile(block.getInputTargetBlock("object"))
                }
            }
            case "get_object_square": {
                return {
                    kind: "GetObjectLnC",
                    object: compile(block.getInputTargetBlock("object"))
                }
            }

            case "get_square_in_lane": {
                return {
                    kind: "GetLnCInLane",
                    lane: compile(block.getInputTargetBlock("lane")),
                    column: compile(block.getInputTargetBlock("column"))
                }
            }


            // Advanced
            case "math_object": {
                return { kind: "GetMath" }
            }
            case "invoke_constructor": {
                const object = compile(block.getInputTargetBlock("object"))
                const args = compile(block.getInputTargetBlock("args"))

                return {
                    kind: "InvokeConstructor",
                    object,
                    args
                }
            }
            case "invoke_object_method_statement":
            case "invoke_object_method_expression": {
                const method = compile(block.getInputTargetBlock("method"))
                const object = compile(block.getInputTargetBlock("object"))
                const args = compile(block.getInputTargetBlock("args"))

                return {
                    kind: "InvokeObjectMethod",
                    object,
                    method,
                    args
                }
            }
            case "system_module": {
                const name = compile(block.getInputTargetBlock("name"))

                return {
                    kind: "GetSystemModule",
                    name
                }
            }


            // Primitives
            case "number":
                return Number(block.getFieldValue("value"))
            case "text":
            case "multiline_text":
                return String(block.getFieldValue("value"))
            case "boolean":
                return block.getFieldValue("value") === "true"
            case "array": {
                const values = []
                let i = 0
                while (block.getInput("ITEM" + i)) {
                    values.push(compile(block.getInputTargetBlock("ITEM" + i)))
                    i++
                }
                return values
            }
            case "null": {
                return null
            }


            // Values
            case "vec2":
                return {
                    kind: "CreateVec2",
                    x: compile(block.getInputTargetBlock("x")),
                    y: compile(block.getInputTargetBlock("y")),
                }
            case "vec3":
                return {
                    kind: "CreateVec3",
                    x: compile(block.getInputTargetBlock("x")),
                    y: compile(block.getInputTargetBlock("y")),
                    z: compile(block.getInputTargetBlock("z")),
                }
            case "rectangle":
                return {
                    kind: "CreateRectangle",
                    width: compile(block.getInputTargetBlock("width")),
                    height: compile(block.getInputTargetBlock("height")),
                    xOffset: compile(block.getInputTargetBlock("xOffset")),
                    yOffset: compile(block.getInputTargetBlock("yOffset")),
                    node: compile(block.getInputTargetBlock("node")),
                }
            case "color": {
                const hex = block.getFieldValue("color")

                return {
                    r: parseInt(hex.slice(1, 3), 16),
                    g: parseInt(hex.slice(3, 5), 16),
                    b: parseInt(hex.slice(5, 7), 16)
                }
            }
            case "color_rgb":
                return {
                    r: compile(block.getInputTargetBlock("red")),
                    g: compile(block.getInputTargetBlock("green")),
                    b: compile(block.getInputTargetBlock("blue"))
                }
            case "plain_json_object": {
                try {
                    return JSON5.parse(block.getFieldValue("object"))
                } catch (e) {
                    logger(`Invalid JSON object: ${e.message}`, "error")
                    return null
                }
            }
            case "zombie_damage_details":
                return {
                    kind: "CreateDamageDetails",
                    damage: compile(block.getInputTargetBlock("damage")),
                    armorProtection: compile(block.getInputTargetBlock("armorProtection")),
                    armorKnockSound: compile(block.getInputTargetBlock("armorKnockSound")),
                    bodyKnockSound: compile(block.getInputTargetBlock("bodyKnockSound")),
                    damageDirection: compile(block.getInputTargetBlock("damageDirection")),
                    damageType: block.getFieldValue("damageType"),
                    flash: compile(block.getInputTargetBlock("flash")),
                    armorAlsoDamagedWhenNotProtecting: compile(
                        block.getInputTargetBlock("armorAlsoDamagedWhenNotProtecting")
                    ),
                    bugKiller: compile(block.getInputTargetBlock("bugKiller")),
                    balloonKiller: compile(block.getInputTargetBlock("balloonKiller")),
                }


            // Debug
            case "console_log": {
                return {
                    kind: "ConsoleLog",
                    values: [compile(block.getInputTargetBlock("value"))],
                }
            }
            case "ui_toast": {
                return {
                    kind: "UIToast",
                    text: compile(block.getInputTargetBlock("text")),
                    type: compile(block.getInputTargetBlock("type")),
                }
            }

            default:
                logger(`Unknown block type: ${block.type}`, "error")
        }
    } catch (e) {
        logger(`Error parsing block ${block.type}: ${e.message}`, "error")
    }
}

function compileStatementList(firstBlock) {
    const actions = []

    let block = firstBlock

    while (block) {
        if (block.isEnabled()) {
            const compiled = compile(block)
            if (compiled != null) {
                actions.push(compiled)
            }
        }

        block = block.getNextBlock()
    }

    return compressActions(actions)
}