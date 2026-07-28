
function getInlineVariables() {
    const vars = []

    for (const block of currentPage.getAllBlocks()) {
        if (block.type === "define_inline_variable") {
            const name = block.getFieldValue("name")
            vars.push([name, name])
        }
    }

    return vars.length ? vars : [["<none>", ""]]
}

const BlocklyConstants = {
    DropDownOptions: {
        MathRoundingType: [
            ["Default", "default"],
            ["Ceil", "ceil"],
            ["Floor", "floor"]
        ],
        DamageType: [
            ["Physical", "physicle"],
            ["Fire", "fire"],
            ["Ray", "ray"],
            ["Electricity", "electricity"],
            ["Potato Mine", "potatoMine"],
        ],

        JalapenoFireColor: [
            ["Yellow", "yellow"],
            ["Green", "green"],
        ],

        JalapenoSpreadPattern: [
            ["Split", "split"],
            ["Left", "left"],
            ["Right", "right"],
            ["Cross", "cross"],
        ],

        ObjectTypes: [
            ["Plants", "Plant"],
            ["Zombies", "Zombie"],
            ["Hypnotized Zombies", "HypnotizedZombie"],
            ["Tombs", "Tomb"]
        ],

        DebugTypes: [
            ["Success", "success"],
            ["Information", "info"],
            ["Warning", "warn"],
            ["Error", "error"]
        ]
    }
}

const blockDefinitions = [
    // Flow
    {
        type: "start_block",
        category: "Flow",
        search_tags: [],
        message0: "Start %1",
        args0: [
            {
                type: "field_input",
                name: "name"
            }
        ],
        inputsInline: true,
        nextStatement: null,
        colour: "#5cc03f"
    },
    {
        type: "sleep",
        category: "Flow",
        search_tags: [],
        message0: "Sleep (Wait) \n Scheduler %1 Clone Context %2 \n Time %3 Actions %4",
        args0: [
            {
                type: "input_value",
                name: "object",
                check: null
            },
            {
                type: "field_checkbox",
                name: "cloneContext"
            },
            {
                type: "input_value",
                name: "time",
                check: ["Number", "Any"]
            },
            {
                type: "input_statement",
                name: "actions"
            }
        ],
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: "#bd7b69"
    },


    // Loops
    {
        type: "for_loop",
        category: "Loops",
        search_tags: [],
        message0: "For Loop\nVariable %1\nIterable %2\nActions %3",
        args0: [
            {
                type: "input_value",
                name: "variable",
                check: ["Text", "Any"]
            },
            {
                type: "input_value",
                name: "iterable",
                check: ["Array", "Any"]
            },
            {
                type: "input_statement",
                name: "actions"
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: "#4d68a0"
    },



    // Logic
    {
        type: "if_statement",
        category: "Logic",
        search_tags: ["if", "condition"],
        message0: "if %1",
        args0: [
            {
                type: "input_value",
                name: "condition",
                check: ["Boolean", "Any"]
            }
        ],
        message1: "then %1",
        args1: [
            {
                type: "input_statement",
                name: "then"
            }
        ],
        mutator: "optional_else_statement_mutator",
        previousStatement: null,
        nextStatement: null,
        colour: "#e89e37"
    },
    {
        type: "ternary_expression",
        category: "Logic",
        search_tags: ["if", "condition"],
        message0: "if %1",
        args0: [
            {
                type: "input_value",
                name: "condition",
                check: ["Boolean", "Any"]
            }
        ],
        message1: "then %1",
        args1: [
            {
                type: "input_value",
                name: "then",
                check: null
            }
        ],
        mutator: "optional_else_expression_mutator",
        output: "Any",
        colour: "#e89e37"
    },
    {
        type: "logic_operation",
        category: "Logic",
        search_tags: ["if", "condition"],
        message0: "%1\n%2\n%3",
        args0: [
            {
                type: "input_value",
                name: "left",
                check: ["Boolean", "Any"]
            },
            {
                type: "field_dropdown",
                name: "operator",
                options: [
                    ["and", "&&"],
                    ["or", "||"],
                ]
            },
            {
                type: "input_value",
                name: "right",
                check: ["Boolean", "Any"]
            },
        ],
        inputsInline: true,
        output: "Boolean",
        colour: "#d9aa32"
    },
    {
        type: "logic_equality_operation",
        category: "Logic",
        search_tags: ["if", "condition"],
        message0: "%1\n%2\n%3",
        args0: [
            {
                type: "input_value",
                name: "left",
                check: null
            },
            {
                type: "field_dropdown",
                name: "operator",
                options: [
                    ["==", "=="],
                    ["!=", "!="],
                    [">", ">"],
                    [">=", ">="],
                    ["<", "<"],
                    ["<=", "<="],
                ]
            },
            {
                type: "input_value",
                name: "right",
                check: null
            },
        ],
        inputsInline: true,
        output: "Boolean",
        colour: "#e1c141"
    },
    {
        type: "logic_not",
        category: "Logic",
        search_tags: ["if", "condition"],
        message0: "not %1",
        args0: [
            {
                type: "input_value",
                name: "value",
                check: ["Boolean", "Any"]
            }
        ],
        inputsInline: true,
        output: "Boolean",
        colour: "#d99132"
    },
    {
        type: "logic_random_chance",
        category: "Logic",
        search_tags: ["condition"],
        message0: "Random Chance %1%",
        args0: [
            {
                type: "input_value",
                name: "chance",
                check: ["Number", "Any"]
            }
        ],
        inputsInline: true,
        output: "Boolean",
        colour: "#7668a8"
    },



    // Math
    {
        type: "math_operation",
        category: "Math",
        search_tags: ["number"],
        message0: "%1\n%2\n%3",
        args0: [
            {
                type: "input_value",
                name: "left",
                check: ["Number", "Any"]
            },
            {
                type: "field_dropdown",
                name: "operator",
                options: [
                    ["+", "+"],
                    ["-", "-"],
                    ["*", "*"],
                    ["**", "**"],
                    ["/", "/"],
                    ["//", "//"],
                    ["%", "%"],
                ]
            },
            {
                type: "input_value",
                name: "right",
                check: ["Number", "Any"]
            },
        ],
        inputsInline: true,
        output: "Number",
        colour: "#4670b6"
    },
    {
        type: "math_random",
        category: "Math",
        search_tags: [],
        message0: "Random\nMin %1 Max %2",
        args0: [
            {
                type: "input_value",
                name: "min",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "max",
                check: ["Number", "Any"]
            }
        ],
        inputsInline: false,
        output: "Number",
        colour: "#6f68a8"
    },



    // Variables
    {
        type: "define_inline_variable",
        category: "Variables",
        search_tags: ["definition"],
        message0: "Set Inline Variable %1 = %2",
        args0: [
            {
                type: "field_input",
                name: "name",
                text: "x"
            },
            {
                type: "input_value",
                name: "value",
                check: null
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: "#924692"
    },
    {
        type: "inline_variable",
        category: "Variables",
        search_tags: [],
        message0: "Inline Variable %1",
        args0: [
            {
                type: "field_dropdown",
                name: "name",
                options: getInlineVariables
            }
        ],
        output: "Any",
        colour: "#924692"
    },
    {
        type: "define_context_variable",
        category: "Variables",
        search_tags: ["definition"],
        message0: "Set Context Variable %1 = %2",
        args0: [
            {
                type: "field_input",
                name: "name",
                text: "x"
            },
            {
                type: "input_value",
                name: "object",
                check: null
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: "#595397"
    },
    {
        type: "context_variable",
        category: "Variables",
        search_tags: [],
        message0: "Context Variable %1",
        args0: [
            {
                type: "field_input",
                name: "name",
                text: "x"
            },
        ],
        mutator: "optional_default_mutator",
        output: "Any",
        colour: "#595397"
    },
    {
        type: "get_context_object",
        category: "Variables",
        search_tags: [],
        message0: "Context Object %1",
        args0: [
            {
                type: "input_value",
                name: "name",
                check: ["Text", "Any"]
            },
        ],
        mutator: "optional_default_mutator",
        inputsInline: false,
        output: "Any",
        colour: "#554f92"
    },
    {
        type: "context",
        category: "Variables",
        search_tags: ["object"],
        message0: "Context",
        output: "Any",
        colour: "#4663a8"
    },
    {
        type: "context_target",
        category: "Variables",
        search_tags: [],
        message0: "Context Target",
        output: "Any",
        colour: "#4e47d7"
    },
    {
        type: "context_source",
        category: "Variables",
        search_tags: [],
        message0: "Context Source",
        output: "Any",
        colour: "#4e47d7"
    },



    // Properties
    {
        type: "set_object_property",
        category: "Properties",
        search_tags: [],
        message0: "Set Property\nObject %1 Property %2 Value %3",
        args0: [
            {
                type: "input_value",
                name: "object",
                check: null
            },
            {
                type: "input_value",
                name: "property",
                check: ["Text", "Any"]
            },
            {
                type: "input_value",
                name: "value",
                check: null
            }
        ],
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: "#924f92"
    },
    {
        type: "set_object_properties",
        category: "Properties",
        search_tags: [],
        message0: "Set Properties\nObject %1",
        args0: [
            {
                type: "input_value",
                name: "object",
                check: null
            }
        ],
        mutator: "properties_mutator",
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: "#924f92"
    },
    {
        type: "modify_object_property",
        category: "Properties",
        search_tags: [],
        message0: "Modify Property\nObject %1 Property %2 Operator %3 \nValue %4",
        args0: [
            {
                type: "input_value",
                name: "object",
                check: null
            },
            {
                type: "input_value",
                name: "property",
                check: ["Text", "Any"]
            },
            {
                type: "field_dropdown",
                name: "operator",
                options: [
                    ["+=", "+="],
                    ["-=", "-="],
                    ["*=", "*="],
                    ["**=", "**="],
                    ["/=", "/="],
                    ["//=", "//="],
                    ["%=", "%="],
                ]
            },
            {
                type: "input_value",
                name: "value",
                check: null
            }
        ],
        mutator: "optional_min_max_mutator",
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: "#924f92"
    },
    {
        type: "get_object_property",
        category: "Properties",
        search_tags: [],
        message0: "Get Object %1 Property %2",
        args0: [
            {
                type: "input_value",
                name: "object",
                check: null
            },
            {
                type: "input_value",
                name: "property",
                check: ["Text", "Any"]
            },
        ],
        mutator: "optional_default_mutator",
        inputsInline: false,
        output: "Any",
        colour: "#924f92"
    },



    // Zombies
    {
        type: "deal_damage_zombie",
        category: "Zombies",
        search_tags: [],
        message0: "Deal Damage to a Zombie\n Damage Details %1 Zombie %2",
        args0: [
            {
                type: "input_value",
                name: "damageDetails",
                check: ["DamageDetails", "Any"]
            },
            {
                type: "input_value",
                name: "zombie",
                check: null
            },
        ],
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: "#ca784b"
    },



    // Plants
    {
        type: "deal_damage_plant",
        category: "Plants",
        search_tags: [],
        message0: "Deal Damage to a Plant\n Damage %1 Plant %2",
        args0: [
            {
                type: "input_value",
                name: "damage",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "plant",
                check: null
            },
        ],
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: "#66a536"
    },
    {
        type: "explode_cherry_bomb",
        category: "Plants",
        search_tags: ["explosion"],
        message0: "Cherry Explosion\nLawn Square %1 Damage %2",
        args0: [
            {
                type: "input_value",
                name: "lnc",
                check: ["LawnSquare", "Any"]
            },
            {
                type: "input_value",
                name: "damage",
                check: ["Number", "Any"]
            },
        ],
        mutator: "explode_cherry_bomb_mutator",
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: "#e33b3b"
    },
    {
        type: "spawn_lane_fire",
        category: "Plants",
        search_tags: [],
        message0:
            "Jalapeno Fire\n" +
            "Lawn Square %1" +
            "Damage %2" +
            "Duration %3" +
            "Spread Distance %4",
        args0: [
            {
                type: "input_value",
                name: "lnc",
                check: ["LawnSquare", "Any"]
            },
            {
                type: "input_value",
                name: "damage",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "duration",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "spreadDistance",
                check: ["Number", "Any"]
            }
        ],
        mutator: "jalapeno_lane_fire_mutator",
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: "#d64b35"
    },


    // Hitboxes
    {
        type: "rectangle_intersects_rectangle",
        category: "Hitboxes",
        search_tags: [],
        message0: "Rectangle Intersects Rectangle\nRectangle 1 %1 Rectangle 2 %2",
        args0: [
            {
                type: "input_value",
                name: "rectangle1",
                check: ["Rectangle", "Any"]
            },
            {
                type: "input_value",
                name: "rectangle2",
                check: ["Rectangle", "Any"]
            },
        ],
        inputsInline: false,
        output: "Boolean",
        colour: "#37a05e"
    },
    {
        type: "zombie_body_rectangle",
        category: "Hitboxes",
        search_tags: [],
        message0: "Zombie Body Rectangle %1",
        args0: [
            {
                type: "input_value",
                name: "zombie",
                check: null
            },
        ],
        inputsInline: false,
        output: "Rectangle",
        colour: "#cbab5f"
    },
    {
        type: "plant_body_rectangle",
        category: "Hitboxes",
        search_tags: [],
        message0: "Plant Body Rectangle %1",
        args0: [
            {
                type: "input_value",
                name: "plant",
                check: null
            },
        ],
        inputsInline: false,
        output: "Rectangle",
        colour: "#76b95c"
    },
    {
        type: "projectile_body_rectangle",
        category: "Hitboxes",
        search_tags: [],
        message0: "Projectile Body Rectangle %1",
        args0: [
            {
                type: "input_value",
                name: "projectile",
                check: null
            },
        ],
        inputsInline: false,
        output: "Rectangle",
        colour: "#67c9a9"
    },



    // Lawn
    {
        type: "lawn_object_pool",
        category: "Lawn",
        search_tags: [],
        message0: "Lawn Object Pool %1",
        args0: [
            {
                type: "field_dropdown",
                name: "objectType",
                options: BlocklyConstants.DropDownOptions.ObjectTypes
            },
        ],
        inputsInline: true,
        output: "Array",
        colour: "#55b74f"
    },
    {
        type: "lane_object_pool",
        category: "Lawn",
        search_tags: [],
        message0: "Lane Object Pool %1 %2",
        args0: [
            {
                type: "field_dropdown",
                name: "objectType",
                options: [
                    ["Plants", "Plant"],
                    ["Zombies", "Zombie"],
                    ["Hypnotized Zombies", "HypnotizedZombie"],
                    ["Tombs", "Tomb"]
                ]
            },
            {
                type: "input_value",
                name: "lane",
                check: ["Lane", "Any"]
            }
        ],
        inputsInline: true,
        output: "Array",
        colour: "#34a853"
    },
    {
        type: "get_lane",
        category: "Lawn",
        search_tags: [],
        message0: "Get Lane by Index %1",
        args0: [
            {
                type: "input_value",
                name: "lane",
                check: ["Number", "Any"]
            }
        ],
        inputsInline: true,
        output: "Lane",
        colour: "#60ad52"
    },
    {
        type: "lane_index",
        category: "Lawn",
        search_tags: [],
        message0: "Get Index of Lane %1",
        args0: [
            {
                type: "input_value",
                name: "lane",
                check: ["Lane", "Any"]
            }
        ],
        inputsInline: true,
        output: "Lane",
        colour: "#50acac"
    },
    {
        type: "upper_lane",
        category: "Lawn",
        search_tags: [],
        message0: "Upper Lane of Lane %1",
        args0: [
            {
                type: "input_value",
                name: "lane",
                check: ["Lane", "Any"]
            }
        ],
        inputsInline: true,
        output: "Lane",
        colour: "#384897"
    },
    {
        type: "lower_lane",
        category: "Lawn",
        search_tags: [],
        message0: "Lower Lane of Lane %1",
        args0: [
            {
                type: "input_value",
                name: "lane",
                check: ["Lane", "Any"]
            }
        ],
        inputsInline: true,
        output: "Lane",
        colour: "#384897"
    },
    {
        type: "get_object_lane",
        category: "Lawn",
        search_tags: [],
        message0: "Lane of Object %1",
        args0: [
            {
                type: "input_value",
                name: "object",
                check: null
            }
        ],
        inputsInline: true,
        output: "Lane",
        colour: "#3e3897"
    },
    {
        type: "get_object_square",
        category: "Lawn",
        search_tags: [],
        message0: "Lawn Square of Object %1",
        args0: [
            {
                type: "input_value",
                name: "object",
                check: null
            }
        ],
        inputsInline: true,
        output: "LawnSquare",
        colour: "#7841c0"
    },
    {
        type: "get_square_in_lane",
        category: "Lawn",
        search_tags: [],
        message0: "Get Lawn Square in Lane\nLane %1 Column %2",
        args0: [
            {
                type: "input_value",
                name: "lane",
                check: ["Lane", "Any"]
            },
            {
                type: "input_value",
                name: "column",
                check: ["Number", "Any"]
            },
        ],
        inputsInline: false,
        output: "LawnSquare",
        colour: "#875ab3"
    },



    // Advanced
    {
        type: "math_object",
        category: "Advanced",
        search_tags: [],
        message0: "JavaScript Math Object",
        args0: [],
        inputsInline: true,
        output: null,
        colour: "#ac87dc"
    },
    {
        type: "invoke_constructor",
        category: "Advanced",
        search_tags: [],
        message0: "Invoke Constructor of %1 with arguments %2",
        args0: [
            {
                type: "input_value",
                name: "object",
                check: null
            },
            {
                type: "input_value",
                name: "args",
                check: ["Array", "Any"]
            }
        ],
        inputsInline: false,
        output: "Array",
        colour: "#dc87dc"
    },
    {
        type: "invoke_object_method_statement",
        category: "Advanced",
        search_tags: [],
        message0: "Invoke Method %1 of Object %2 with arguments %3",
        args0: [
            {
                type: "input_value",
                name: "method",
                check: ["Text", "Any"]
            },
            {
                type: "input_value",
                name: "object",
                check: null
            },
            {
                type: "input_value",
                name: "args",
                check: ["Array", "Any"]
            }
        ],
        inputsInline: false,
        previousStatement: null,
        nextStatement: null,
        colour: "#86b958"
    },
    {
        type: "invoke_object_method_expression",
        category: "Advanced",
        search_tags: [],
        message0: "Invoke Method %1 of Object %2 with arguments %3",
        args0: [
            {
                type: "input_value",
                name: "method",
                check: ["Text", "Any"]
            },
            {
                type: "input_value",
                name: "object",
                check: null
            },
            {
                type: "input_value",
                name: "args",
                check: ["Array", "Any"]
            }
        ],
        inputsInline: false,
        output: "Any",
        colour: "#86b958"
    },
    {
        type: "system_module",
        category: "Advanced",
        search_tags: [],
        message0: "System Module %1",
        args0: [
            {
                type: "input_value",
                name: "name",
                check: ["Text", "Any"]
            }
        ],
        inputsInline: true,
        output: "Any",
        colour: "#c45b89"
    },



    // Primitives
    {
        type: "number",
        category: "Primitives",
        search_tags: ["math"],
        message0: "Number %1",
        args0: [
            {
                type: "field_number",
                name: "value",
                value: 0
            }
        ],
        output: "Number",
        colour: "#58c665"
    },
    {
        type: "text",
        category: "Primitives",
        search_tags: ["string"],
        message0: "Text %1",
        args0: [
            {
                type: "field_input",
                name: "value",
                value: ""
            }
        ],
        output: "Text",
        colour: "#e59451"
    },
    {
        type: "multiline_text",
        category: "Primitives",
        search_tags: ["string"],
        message0: "Multiline Text %1",
        args0: [
            {
                type: "field_multiline_text",
                name: "value",
                value: ""
            }
        ],
        output: "Text",
        colour: "#e59451"
    },
    {
        type: "boolean",
        category: "Primitives",
        search_tags: ["condition"],
        message0: "Boolean %1",
        args0: [
            {
                type: "field_dropdown",
                name: "value",
                options: [
                    ["true", "true"],
                    ["false", "false"]
                ]
            }
        ],
        output: "Boolean",
        colour: "#88d0bf"
    },
    {
        type: "array",
        category: "Primitives",
        search_tags: ["list"],
        message0: "Array %1",
        args0: [{ type: "input_dummy", name: "EMPTY" }],
        mutator: "array_mutator",
        inputsInline: false,
        output: "Array",
        colour: "#c03e3e"
    },
    {
        type: "null",
        category: "Primitives",
        search_tags: ["none", "undefined"],
        message0: "Null",
        args0: [],
        inputsInline: false,
        output: null,
        colour: "#a2a2a2"
    },



    // Values
    {
        type: "vec2",
        category: "Values",
        search_tags: ["vector", "2d"],
        message0: "Vec2 x%1 y%2",
        args0: [
            {
                type: "input_value",
                name: "x",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "y",
                check: ["Number", "Any"]
            },
        ],
        inputsInline: true,
        output: "Vec2",
        colour: "#cb8a46"
    },
    {
        type: "vec3",
        category: "Values",
        search_tags: ["vector", "3d"],
        message0: "Vec3 x%1 y%2 z%3",
        args0: [
            {
                type: "input_value",
                name: "x",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "y",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "z",
                check: ["Number", "Any"]
            },
        ],
        inputsInline: true,
        output: "Vec3",
        colour: "#e09855"
    },
    {
        type: "rectangle",
        category: "Values",
        search_tags: ["hitbox"],
        message0: "Rectangle \nWidth %1 \nHeight %2\nX Offset %3\nY Offset %4\nCenter Node %5",
        args0: [
            {
                type: "input_value",
                name: "width",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "height",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "xOffset",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "yOffset",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "node",
                check: null
            },
        ],
        inputsInline: true,
        output: "Rectangle",
        colour: "#54a3cb"
    },
    {
        type: "color",
        category: "Values",
        search_tags: ["rgb"],
        message0: "Color %1",
        args0: [
            {
                type: "field_input",
                name: "color",
                text: "#ff0000"
            }
        ],
        inputsInline: true,
        output: "Color",
        colour: "#cd0dcd"
    },
    {
        type: "color_rgb",
        category: "Values",
        search_tags: [],
        message0: "Color R%1 G%2 B%3",
        args0: [
            {
                type: "input_value",
                name: "red",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "green",
                check: ["Number", "Any"]
            },
            {
                type: "input_value",
                name: "blue",
                check: ["Number", "Any"]
            },
        ],
        inputsInline: true,
        output: "Color",
        colour: "#cd0dcd"
    },
    {
        type: "plain_json_object",
        category: "Values",
        search_tags: [],
        message0: "JSON Object %1",
        args0: [
            {
                type: "field_multiline_json",
                name: "object",
                text: "{}"
            }
        ],
        inputsInline: true,
        output: "Any",
        colour: "#4c54dc"
    },
    {
        type: "zombie_damage_details",
        category: "Values",
        search_tags: [],
        message0: "Zombie Damage Details\n Damage %1 Damage Type %2\n Armor Protection %3 Armor Knock Sound %4 Body Knock Sound %5 Flash %6 Always Damage Armor %7 Damage Direction %8 Bug Killer %9 Balloon Killer %10",
        args0: [
            {
                type: "input_value",
                name: "damage",
                check: ["Number", "Any"]
            },
            {
                type: "field_dropdown",
                name: "damageType",
                options: BlocklyConstants.DropDownOptions.DamageType
            },
            {
                type: "input_value",
                name: "armorProtection",
                check: ["Boolean", "Any"]
            },
            {
                type: "input_value",
                name: "armorKnockSound",
                check: ["Boolean", "Any"]
            },
            {
                type: "input_value",
                name: "bodyKnockSound",
                check: ["Boolean", "Any"]
            },
            {
                type: "input_value",
                name: "flash",
                check: ["Boolean", "Any"]
            },
            {
                type: "input_value",
                name: "armorAlsoDamagedWhenNotProtecting",
                check: ["Boolean", "Any"]
            },
            {
                type: "input_value",
                name: "damageDirection",
                check: ["Vec2", "Any"]
            },
            {
                type: "input_value",
                name: "bugKiller",
                check: ["Boolean", "Any"]
            },
            {
                type: "input_value",
                name: "balloonKiller",
                check: ["Boolean", "Any"]
            },
        ],
        inputsInline: false,
        output: "DamageDetails",
        colour: "#6dbb31"
    },



    // Debug
    {
        type: "console_log",
        category: "Debug",
        search_tags: ["logger", "print"],
        message0: "Console Log %1",
        args0: [
            {
                type: "input_value",
                name: "value",
                check: null
            }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: "#607D8B"
    },
    {
        type: "ui_toast",
        category: "Debug",
        search_tags: ["logger", "print"],
        message0: "UI Toast %1 %2",
        args0: [
            {
                type: "field_dropdown",
                name: "type",
                options: BlocklyConstants.DropDownOptions.DebugTypes
            },
            {
                type: "input_value",
                name: "text",
                check: null
            },
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: "#6696aa"
    },
]

for (const key of Object.keys(Blockly.Blocks)) {
    delete Blockly.Blocks[key] // delete all vanilla blocks
}

addConnectionSpacing(blockDefinitions, 2)

Blockly.defineBlocksWithJsonArray(blockDefinitions)

const blockDefinitionMap = new Map(
    blockDefinitions.map(def => [def.type, def])
)

function attachHighlightListener(workspace) {
    workspace.addChangeListener((e) => {
        const triggers = [
            Blockly.Events.BLOCK_MOVE,
            Blockly.Events.BLOCK_CHANGE,
            Blockly.Events.BLOCK_CREATE,
            Blockly.Events.BLOCK_DELETE,
            Blockly.Events.FINISHED_LOADING,
        ]

        if (triggers.includes(e.type)) {
            updateConnectionHighlights(workspace)
        }
    })
}

const typeMap = {
    Number: ["#58c665", "Number"],
    Text: ["#e59451", "Text"],
    Boolean: ["#88d0bf", "Boolean"],
    Array: ["#c03e3e", "Array"],
    Vec2: ["#cb8a46", "Vec2"],
    Vec3: ["#e09855", "Vec3"],
    Rectangle: ["#54a3cb", "Rectangle"],
    Color: ["#cd0dcd", "Color"],
    DamageDetails: ["#6dbb31", "Zombie Damage Details"],
    Lane: ["#60ad52", "Lane"],
    LawnSquare: ["#875ab3", "Lawn Square"],
    Any: ["#acb1b7", "Any"],
}

function getConnectionTypeLabel(connection) {
    const check = connection.getCheck()
    if (!check || check.length === 0) return "Any"
    const type = (check.find(t => t !== "Any") || check[0]) ?? "Any"

    if (typeMap[type] === undefined) {
        console.log(`Type ${type} doesn't exist in type map!`)
    }

    return (typeMap[type] || typeMap.Any)[1]
}

function getConnectionColor(connection) {
    const check = connection.getCheck()
    if (!check || check.length === 0) return typeMap.Any[0]
    const type = (check.find(t => t !== "Any") || check[0]) ?? "Any"

    if (typeMap[type] === undefined) {
        console.log(`Type ${type} doesn't exist in type map!`)
    }

    return (typeMap[type] || typeMap.Any)[0]
}

function addConnectionSpacing(defs, spaces = 2) {
    const pad = "\u00A0".repeat(spaces)

    for (const def of defs) {
        for (const msgKey of ["message0", "message1", "message2", "message3"]) {
            if (!def[msgKey]) continue

            const argsKey = "args" + msgKey.slice(-1)
            const oldArgs = def[argsKey]
            if (!oldArgs) continue

            const tokens = def[msgKey].split(/(%\d+)/g).filter(t => t !== "")

            const newArgs = []
            const newMsgParts = []
            let argCounter = 1

            for (const tok of tokens) {
                const m = tok.match(/^%(\d+)$/)
                if (!m) {
                    newMsgParts.push(tok)
                    continue
                }
                const origArg = oldArgs[Number(m[1]) - 1]

                if (origArg && origArg.type === "input_value") {
                    newArgs.push({
                        type: "field_label",
                        name: `__spacer${argCounter}`,
                        text: pad
                    })
                    newMsgParts.push(`%${argCounter}`)
                    argCounter++
                }

                newArgs.push(origArg)
                newMsgParts.push(`%${argCounter}`)
                argCounter++
            }

            def[msgKey] = newMsgParts.join("")
            def[argsKey] = newArgs
        }
    }
    return defs
}

const MARKER_OFFSET_X = -20
const MARKER_OFFSET_Y = 8
const MARKER_RADIUS = 5
const OUTPUT_MARKER_OFFSET_X = -3
const OUTPUT_MARKER_OFFSET_Y = 8

function updateConnectionHighlights(workspace) {
    for (const block of workspace.getAllBlocks(false)) {
        if (block.typedConnectionMarkerGroup) {
            block.typedConnectionMarkerGroup.remove()
            block.typedConnectionMarkerGroup = null
        }

        const markerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
        markerGroup.setAttribute("class", "typedConnectionMarkers")

        for (const input of block.inputList) {
            const connection = input.connection
            if (!connection || connection.type !== Blockly.INPUT_VALUE) continue

            let offset
            try {
                offset = connection.getOffsetInBlock()
            } catch (e) {
                continue
            }

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
            circle.setAttribute("cx", offset.x + MARKER_OFFSET_X)
            circle.setAttribute("cy", offset.y + MARKER_OFFSET_Y)
            circle.setAttribute("r", MARKER_RADIUS)
            circle.setAttribute("fill", getConnectionColor(connection))
            circle.setAttribute("stroke", "#000")
            circle.setAttribute("stroke-width", "0.5")
            circle.setAttribute("pointer-events", "auto")
            circle.style.cursor = "default"

            const title = document.createElementNS("http://www.w3.org/2000/svg", "title")
            title.textContent = getConnectionTypeLabel(connection)
            circle.appendChild(title)

            markerGroup.appendChild(circle)
        }

        const outConnection = block.outputConnection
        if (outConnection) {
            let offset
            try {
                offset = outConnection.getOffsetInBlock()
            } catch (e) {
                offset = null
            }
            if (outConnection.isConnected()) continue

            if (offset) {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
                circle.setAttribute("cx", offset.x + OUTPUT_MARKER_OFFSET_X)
                circle.setAttribute("cy", offset.y + OUTPUT_MARKER_OFFSET_Y)
                circle.setAttribute("r", MARKER_RADIUS)
                circle.setAttribute("fill", getConnectionColor(outConnection))
                circle.setAttribute("stroke", "#000")
                circle.setAttribute("stroke-width", "0.5")
                circle.setAttribute("pointer-events", "auto")
                circle.style.cursor = "default"

                const title = document.createElementNS("http://www.w3.org/2000/svg", "title")
                title.textContent = getConnectionTypeLabel(outConnection)
                circle.appendChild(title)

                markerGroup.appendChild(circle)
            }
        }

        if (markerGroup.childNodes.length > 0) {
            block.getSvgRoot().appendChild(markerGroup)
            block.typedConnectionMarkerGroup = markerGroup
        }
    }
}