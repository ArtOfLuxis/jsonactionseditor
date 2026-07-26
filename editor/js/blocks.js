
function getInlineVariables() {
    const vars = [];

    for (const block of currentPage.getAllBlocks()) {
        if (block.type === "define_inline_variable") {
            const name = block.getFieldValue("name");
            vars.push([name, name])
        }
    }

    return vars.length ? vars : [["<none>", ""]]
}

const blockDefinitions = [
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
        message2: "else %1",
        args2: [
            {
                type: "input_statement",
                name: "else"
            }
        ],
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
        message2: "else %1",
        args2: [
            {
                type: "input_value",
                name: "else",
                check: null
            }
        ],
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



    // Other
    {
        type: "console_log",
        category: "Other",
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
        type: "sleep",
        category: "Other",
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
        mutator: "optional_min_max_properties",
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



    // Gameplay
    {
        type: "explode_cherry_bomb",
        category: "Gameplay",
        search_tags: ["explosion"],
        message0: "Cherry Explosion\nLnC %1 Damage %2",
        args0: [
            {
                type: "input_value",
                name: "lnc",
                check: null
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



    // Advanced
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
    {
        type: "get_context_object",
        category: "Advanced",
        search_tags: [],
        message0: "Context Object %1",
        args0: [
            {
                type: "input_value",
                name: "name"
            },
        ],
        mutator: "optional_default_mutator",
        inputsInline: false,
        output: "Any",
        colour: "#554f92"
    },
    {
        type: "context",
        category: "Advanced",
        search_tags: ["object"],
        message0: "Context",
        output: "Any",
        colour: "#4663a8"
    },



    // Primitives
    {
        type: "number",
        category: "Primitives",
        search_tags: ["primitive", "math"],
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
        search_tags: ["primitive", "string"],
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
        type: "boolean",
        category: "Primitives",
        search_tags: ["primitive", "condition"],
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



    // Types
    {
        type: "vec2",
        category: "Types",
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
        category: "Types",
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
        category: "Types",
        search_tags: ["hitbox"],
        message0: "Rectangle \nWidth %1 \nHeight %2\nCenter Node %3",
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
                name: "node",
                check: null
            },
        ],
        inputsInline: true,
        output: "Rectangle",
        colour: "#54a3cb"
    },
    {
        type: "array",
        category: "Types",
        search_tags: ["list"],
        message0: "Array %1",
        args0: [{ type: "input_dummy", name: "EMPTY" }],
        mutator: "array_mutator",
        inputsInline: false,
        output: "Array",
        colour: "#c03e3e"
    },
    {
        type: "color",
        category: "Types",
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
        category: "Types",
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
        category: "Types",
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
        type: "null",
        category: "Types",
        search_tags: ["list"],
        message0: "Null",
        args0: [],
        inputsInline: false,
        output: null,
        colour: "#a2a2a2"
    },
]

for (const key of Object.keys(Blockly.Blocks)) {
    delete Blockly.Blocks[key] // delete all vanilla blocks
}

Blockly.defineBlocksWithJsonArray(blockDefinitions)

const blockDefinitionMap = new Map(
    blockDefinitions.map(def => [def.type, def])
)