
function getSearchText(type, def) {
    const parts = [type]

    for (const [key, value] of Object.entries(def)) {
        if (key.startsWith("message") && typeof value === "string") {
            parts.push(value)
        }

        if (key.startsWith("args") && Array.isArray(value)) {
            for (const arg of value) {
                if (arg.name) {
                    parts.push(arg.name)
                }

                if (arg.type) {
                    parts.push(arg.type)
                }

                if (arg.check) {
                    parts.push(...[].concat(arg.check))
                }

                if (Array.isArray(arg.options)) {
                    for (const option of arg.options) {
                        if (Array.isArray(option)) {
                            parts.push(...option.map(String))
                        } else {
                            parts.push(String(option))
                        }
                    }
                }
            }
        }
    }

    if (def.search_tags) {
        parts.push(...def.search_tags)
    }

    if (def.category) {
        parts.push(def.category)
    }

    if (def.output) {
        parts.push(def.output)
    }

    return parts
        .join("")
        .replace(/%[0-9]+/g, "")
        .toLowerCase()
}

let currentSearch = []

function searchCallback() {
    const blocks = []

    for (const [type, def] of blockDefinitionMap) {
        const searchText = getSearchText(type, def)

        if (currentSearch.every(tag => searchText.includes(tag))) {
            const block = document.createElement("block")
            block.setAttribute("type", type)
            blocks.push(block)
        }
    }

    return blocks
}

function registerSearchCallback(workspace) {
    workspace.registerToolboxCategoryCallback("SEARCH_RESULTS", searchCallback)
}

document.getElementById("toolboxSearch").addEventListener("input", e => {
    currentSearch = e.target.value.trim().toLowerCase().split(" ")

    const toolboxUi = currentPage.getToolbox()
    const searchItem = toolboxUi.getToolboxItems().find(
        item => item.getName?.() === "Search Results"
    )

    if (toolboxUi.getSelectedItem() !== searchItem) {
        toolboxUi.setSelectedItem(searchItem)
    } else {
        toolboxUi.refreshSelection()
    }
})