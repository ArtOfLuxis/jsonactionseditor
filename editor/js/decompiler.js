function newBlock(type, workspace) {
    const block = workspace.newBlock(type)
    block.initSvg()
    return block
}

function withObjectDefault(value) {
    return value ?? { kind: "GetContextObject", name: "target" }
}

function createBlockFromJson(data, workspace) {
    let block

    switch (data.kind) {
        case "If":
            block = newBlock("if_statement", workspace)

            block.hasElse_ = isNotNull(data.else)
            block.updateShape_()

            createValueInput(block, "condition", data.condition)
            createStatementInput(block, "then", data.then)

            if (block.hasElse_) {
                createStatementInput(block, "else", data.else)
            }
            break


        case "For":
            block = newBlock("for_loop", workspace)

            createValueInput(block, "variable", data.variable)
            createValueInput(block, "iterable", data.iterable)
            createStatementInput(block, "actions", data.actions)
            break
        case "Repeat":
            block = newBlock("repeat_loop", workspace)

            createValueInput(block, "variable", data.variable)
            createValueInput(block, "times", data.times)
            createStatementInput(block, "actions", data.actions)
            break

        case "ConsoleLog":
            block = newBlock("console_log", workspace)

            createValueInput(block, "value", data.values[0])
            break

        case "UIToast":
            block = newBlock("ui_toast", workspace)

            createValueInput(block, "text", data.text)
            block.setFieldValue(data.type, "type")
            break

        case "Sleep":
            block = newBlock("sleep", workspace)

            block.setFieldValue(data.cloneContext, "cloneContext")
            createValueInput(block, "object", data.object)
            createValueInput(block, "time", data.time)
            createStatementInput(block, "actions", data.actions)
            break

        case "SetContextObject":
            block = newBlock("define_context_variable", workspace)

            block.setFieldValue(data.name, "name")
            createValueInput(block, "object", data.object)
            break

        case "SetObjectProperty":
            block = newBlock("set_object_property", workspace)

            createValueInput(block, "property", data.property)
            createValueInput(block, "object", withObjectDefault(data.object))
            createValueInput(block, "value", data.value)
            break

        case "SetObjectProperties": {
            block = newBlock("set_object_properties", workspace)

            createValueInput(
                block,
                "object",
                withObjectDefault(data.object)
            )

            block.entries_ = Object.keys(data.properties)
            block.updateShape_()

            let i = 0
            for (const [key, value] of Object.entries(data.properties)) {
                createValueInput(block, "VALUE" + i, value)
                i++
            }

            break
        }

        case "ModifyObjectProperty":
            block = newBlock("modify_object_property", workspace)

            block.setFieldValue(data.operator, "operator")
            createValueInput(block, "property", data.property)
            createValueInput(block, "object", withObjectDefault(data.object))
            createValueInput(block, "value", data.value)
            break

        case "DealDamageZombie":
            block = newBlock("deal_damage_zombie", workspace)

            createValueInput(block, "zombie", withObjectDefault(data.zombie))
            createValueInput(block, "damageDetails", data.damageDetails)
            break
        case "DealDamagePlant":
            block = newBlock("deal_damage_plant", workspace)

            createValueInput(block, "plant", withObjectDefault(data.plant))
            createValueInput(block, "damage", data.damage)
            break

        case "ExplodeCherryBomb": {
            block = newBlock("explode_cherry_bomb", workspace)

            block.setOptionalInputs_(data)

            createValueInput(block, "lnc", data.lnc)
            createValueInput(block, "damage", data.damage)

            createValueInput(block, "showExplosionText", data.showExplosionText)

            createValueInput(block, "color", data.color)
            createValueInput(block, "scale", data.scale)

            createValueInput(block, "explosionWidth", data.explosionWidth)
            createValueInput(block, "explosionHeight", data.explosionHeight)
            createValueInput(block, "explosionLanes", data.explosionLanes)

            createValueInput(block, "xOffset", data.xOffset)
            createValueInput(block, "yOffset", data.yOffset)

            createValueInput(block, "armorProtection", data.armorProtection)
            createValueInput(block, "armorKnockSound", data.armorKnockSound)
            createValueInput(block, "bodyKnockSound", data.bodyKnockSound)

            createValueInput(block, "damageType", data.damageType)

            createValueInput(block, "screenShakeDuration", data.screenShakeDuration)

            createValueInput(block, "positionOverride", data.positionOverride)

            createValueInput(block, "playSound", data.playSound)

            createStatementInput(block, "zombieCallback", data.zombieCallback)

            break
        }

        case "SpawnLaneFire": {
            block = newBlock("spawn_lane_fire", workspace)

            block.setOptionalInputs_(data)

            createValueInput(block, "lnc", data.lnc)
            createValueInput(block, "damage", data.damage)
            createValueInput(block, "armorProtection", data.armorProtection)
            createValueInput(block, "duration", data.duration)
            createValueInput(block, "height", data.height ?? data.length)
            block.setFieldValue(data.color, "color")
            block.setFieldValue(data.spreadStyle, "spreadStyle")
            createValueInput(block, "spreadSpeed", data.spreadSpeed ?? data.fireLength)
            createValueInput(block, "spreadDistance", data.spreadDistance ?? data.fireWidth)
            createValueInput(block, "zombieWhitelist", data.zombieWhitelist ?? data.whitelist)
            createValueInput(block, "hypnoIncluded", data.hypnoIncluded)
            createValueInput(block, "plantsIncluded", data.plantsIncluded)
            createValueInput(block, "isDPS", data.isDPS)
            createValueInput(block, "burnsFlying", data.burnsFlying)
            createValueInput(block, "parentObject", data.parentObject ?? data.parent)

            break
        }

        case "GetCurrentSunCount":
            block = newBlock("get_current_sun_count", workspace)
            break

        case "RectangleIntersectsRectangle":
            block = newBlock("rectangle_intersects_rectangle", workspace)

            createValueInput(block, "rectangle1", data.rectangle1)
            createValueInput(block, "rectangle2", data.rectangle2)
            break

        case "InvokeObjectMethod": {
            if (data.method === "explodeCherry3x3" && data.args?.length <= 2) {
                block = newBlock("explode_cherry_bomb", workspace)

                createValueInput(block, "lnc", withObjectDefault(data.object))
                createValueInput(block, "damage", data.args[0] ?? 1800)

                if (typeof data.args[1] === "boolean") {
                    block.explodeOptions_ = ["showExplosionText"]
                    block.updateShape_()

                    createValueInput(block, "showExplosionText", data.args[1])
                }
                break
            }
            block = newBlock("invoke_object_method_statement", workspace)

            createValueInput(block, "method", data.method)
            createValueInput(block, "object", withObjectDefault(data.object))
            createValueInput(block, "args", data.args)
            break
        }

        default:
            logger(`Unknown JSON block: ${data.kind} (${JSON.stringify(data)})`, "error")
            return
    }

    return block
}

function createValueBlock(value, workspace) {
    if (value === null || value === undefined) {
        return newBlock("null", workspace)
    }

    if (typeof value === "number") {
        const block = newBlock("number", workspace)
        block.setFieldValue(String(value), "value")
        return block
    }

    if (typeof value === "boolean") {
        const block = newBlock("boolean", workspace)
        block.setFieldValue(String(value), "value")
        return block
    }

    if (typeof value === "string") {
        const block = newBlock("text", workspace)
        block.setFieldValue(String(value), "value")
        return block
    }

    if (Array.isArray(value)) {
        const block = newBlock("array", workspace)

        block.itemTypes_ = value.map(value => {
            if (typeof value === "number") return "Number"
            if (typeof value === "string") return "Text"
            if (Array.isArray(value)) return "Array"
            return "Any"
        })
        block.updateShape_()

        value.forEach((item, i) => {
            createValueInput(block, "ITEM" + i, item)
        })

        return block
    }

    if (typeof value === "object") {
        switch (value.kind) {
            case "Ternary": {
                const block = newBlock("ternary_expression", workspace)

                block.hasElse_ = isNotNull(value.else)
                block.updateShape_()

                createValueInput(block, "condition", value.condition)
                createValueInput(block, "then", value.then)

                if (block.hasElse_) {
                    createValueInput(block, "else", value.else)
                }

                return block
            }

            case "MathRandomChance": {
                const block = newBlock("logic_random_chance", workspace)

                createValueInput(block, "chance", value.chance)

                return block
            }

            case "MathRandomRange": {
                const block = newBlock("math_random", workspace)

                createValueInput(block, "min", value.min)
                createValueInput(block, "max", value.max)

                return block
            }

            case "MathRound": {
                const block = newBlock("math_round", workspace)

                createValueInput(block, "rounding", value.rounding)
                createValueInput(block, "number", value.number)

                return block
            }

            case "GetMath": {
                return newBlock("get_math", workspace)
            }
            case "InvokeConstructor": {
                const block = newBlock("invoke_constructor", workspace)

                createValueInput(block, "object", value.object)
                createValueInput(block, "args", value.args)

                return block
            }
            case "InvokeObjectMethod": {
                const block = newBlock("invoke_object_method_expression", workspace)

                createValueInput(block, "method", value.method)
                createValueInput(block, "object", withObjectDefault(value.object))
                createValueInput(block, "args", value.args)

                return block
            }
            case "GetContextObject": {
                let block
                const objectName = value.name ?? "target"
                if (objectName === "target") {
                    block = newBlock("context_target", workspace)
                } else if (objectName === "source") {
                    block = newBlock("context_source", workspace)
                } else {
                    if (typeof objectName === "string") {
                        block = newBlock("context_variable", workspace)
                        block.setFieldValue(objectName, "name")
                    } else {
                        block = newBlock("get_context_object", workspace)
                        createValueInput(block, "name", objectName)
                    }

                    if (value.default !== undefined) {
                        block.hasDefault_ = true
                        block.updateShape_()
                        createValueInput(block, "default", value.default)
                    }
                }

                return block
            }
            case "GetContext": {
                return newBlock("context", workspace)
            }
            case "GetObjectProperty": {
                const block = newBlock("get_object_property", workspace)

                createValueInput(block, "property", value.property)

                createValueInput(block, "object", withObjectDefault(value.object))

                if (value.default !== undefined) {
                    block.hasDefault_ = true
                    block.updateShape_()
                    createValueInput(block, "default", value.default)
                }

                return block
            }

            case "GetLane": {
                const block = newBlock("get_lane", workspace)

                createValueInput(block, "lane", value.lane)

                return block
            }

            case "GetUpperLane": {
                const block = newBlock("upper_lane", workspace)

                createValueInput(block, "lane", value.lane)

                return block
            }

            case "GetLowerLane": {
                const block = newBlock("lower_lane", workspace)

                createValueInput(block, "lane", value.lane)

                return block
            }

            case "GetLaneIndex": {
                const block = newBlock("lane_index", workspace)

                createValueInput(block, "lane", value.lane)

                return block
            }
            case "GetObjectLane": {
                const block = newBlock("get_object_lane", workspace)

                createValueInput(block, "object", withObjectDefault(value.object))

                return block
            }

            case "GetObjectLnC": {
                const block = newBlock("get_object_square", workspace)

                createValueInput(block, "object", withObjectDefault(value.object))

                return block
            }

            case "GetLnCInLane": {
                const block = newBlock("get_square_in_lane", workspace)

                createValueInput(block, "lane", value.lane)
                createValueInput(block, "column", value.column)

                return block
            }

            case "GetPlantPoolArray":
            case "GetZombiePoolArray":
            case "GetHypnotizedZombiePoolArray":
            case "GetTombPoolArray": {
                const block = newBlock("lawn_object_pool", workspace)

                block.setFieldValue(
                    value.kind.replace("Get", "").replace("PoolArray", ""),
                    "objectType"
                )

                return block
            }

            case "GetLanePlantPoolArray":
            case "GetLaneZombiePoolArray":
            case "GetLaneHypnotizedZombiePoolArray":
            case "GetLaneTombPoolArray": {
                const block = newBlock("lane_object_pool", workspace)

                block.setFieldValue(
                    value.kind.replace("GetLane", "").replace("PoolArray", ""),
                    "objectType"
                )

                createValueInput(block, "lane", value.lane)

                return block
            }

            case "ZombieBodyRectangle": {
                const block = newBlock("zombie_body_rectangle", workspace)

                createValueInput(block, "zombie", value.zombie)
                createValueInput(
                    block,
                    "rectangleForProjectiles",
                    value.rectangleForProjectiles
                )

                return block
            }

            case "PlantBodyRectangle": {
                const block = newBlock("plant_body_rectangle", workspace)

                createValueInput(block, "plant", value.plant)

                return block
            }

            case "ProjectileBodyRectangle": {
                const block = newBlock("projectile_body_rectangle", workspace)

                createValueInput(block, "projectile", value.projectile)

                return block
            }

            case "GetSystemModule": {
                const block = newBlock("system_module", workspace)

                createValueInput(block, "name", value.name)

                return block
            }

            case "CreateVec2": {
                const block = newBlock("vec2", workspace)

                createValueInput(block, "x", value.x)
                createValueInput(block, "y", value.y)

                return block
            }
            case "CreateVec3": {
                const block = newBlock("vec3", workspace)

                createValueInput(block, "x", value.x)
                createValueInput(block, "y", value.y)
                createValueInput(block, "z", value.z)

                return block
            }
            case "CreateRectangle": {
                const block = newBlock("rectangle", workspace)

                createValueInput(block, "width", value.width)
                createValueInput(block, "height", value.height)
                createValueInput(block, "xOffset", value.xOffset)
                createValueInput(block, "yOffset", value.yOffset)
                createValueInput(block, "node", value.node)

                return block
            }
            case "CreateDamageDetails": {
                const block = newBlock("zombie_damage_details", workspace)

                block.setFieldValue(value.damageType ?? "physicle", "damageType")
                createValueInput(block, "damage", value.damage)
                createValueInput(block, "armorProtection", value.armorProtection)
                createValueInput(block, "armorKnockSound", value.armorKnockSound)
                createValueInput(block, "bodyKnockSound", value.bodyKnockSound)
                createValueInput(block, "damageDirection", value.damageDirection)
                createValueInput(block, "flash", value.flash)
                createValueInput(block, "armorAlsoDamagedWhenNotProtecting", value.armorAlsoDamagedWhenNotProtecting)
                createValueInput(block, "bugKiller", value.bugKiller)
                createValueInput(block, "balloonKiller", value.balloonKiller)

                return block
            }

            case "&&":
            case "||": {
                const block = newBlock("logic_operation", workspace)

                block.setFieldValue(value.kind, "operator")

                createValueInput(block, "left", value.left)
                createValueInput(block, "right", value.right)

                return block
            }

            case "==":
            case "!=":
            case ">":
            case ">=":
            case "<":
            case "<=": {
                const block = newBlock("logic_equality_operation", workspace)

                block.setFieldValue(value.kind, "operator")

                createValueInput(block, "left", value.left)
                createValueInput(block, "right", value.right)

                return block
            }

            case "+":
            case "-":
            case "*":
            case "**":
            case "/":
            case "//":
            case "%": {
                const block = newBlock("math_operation", workspace)

                block.setFieldValue(
                    value.kind,
                    "operator"
                )

                createValueInput(block, "left", value.left)
                createValueInput(block, "right", value.right)

                return block
            }
        }
    }

    if (
        typeof value === "object" &&
        Object.keys(value).length === 3 &&
        "r" in value &&
        "g" in value &&
        "b" in value
    ) {
        const isConstant =
            typeof value.r === "number" &&
            typeof value.g === "number" &&
            typeof value.b === "number"

        if (isConstant) {
            const block = newBlock("color", workspace)

            const hex =
                "#" +
                value.r.toString(16).padStart(2, "0") +
                value.g.toString(16).padStart(2, "0") +
                value.b.toString(16).padStart(2, "0")

            block.setFieldValue(hex, "color")
            return block
        }

        const block = newBlock("color_rgb", workspace)
        createValueInput(block, "red", value.r)
        createValueInput(block, "green", value.g)
        createValueInput(block, "blue", value.b)
        return block
    }


    if (
        typeof value === "object" &&
        !("kind" in value)
    ) {
        const block = newBlock("plain_json_object", workspace)

        block.setFieldValue(
            JSON.stringify(value),
            "object"
        )

        return block
    }

    if (typeof value === "object") {
        return createBlockFromJson(value, workspace)
    }

    logger(`Unknown value: ${JSON.stringify(value)}`, "error")
    return null
}

function createValueInput(parent, inputName, value) {
    if (value === undefined) return

    const child = createValueBlock(value, parent.workspace)

    if (!child) return

    if (Array.isArray(parent.optionalInputs_) && !parent.optionalInputs_.includes(inputName)) {
        parent.optionalInputs_.push(inputName)
        parent.updateShape_()
    }

    const input = parent.getInput(inputName)
    if (!input) {
        logger(
            `Block "${parent.type}" has no input "${inputName}".\n` +
            `Value: ${JSON.stringify(value, null, 2)}`,
            "error"
        )
    }

    input?.connection?.connect(child.outputConnection)
}

function createStatementInput(parent, inputName, statements) {
    if (!statements) return

    let previousBlock = null

    for (const statement of statements) {
        const block = createBlockFromJson(
            statement,
            parent.workspace
        )

        if (!block) continue

        if (previousBlock) {
            previousBlock.nextConnection.connect(
                block.previousConnection
            )
        } else {

            const input = parent.getInput(inputName)
            if (!input) {
                logger(
                    `Block "${parent.type}" has no input "${inputName}".\n` +
                    `Statements: ${JSON.stringify(statements, null, 2)}`,
                    "error"
                )
            }

            input?.connection?.connect(block.previousConnection)
        }

        previousBlock = block
    }
}