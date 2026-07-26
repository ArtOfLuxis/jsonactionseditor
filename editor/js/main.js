
const zoom = {
    controls: true,
    wheel: true,
    startScale: 1,
    maxScale: 3,
    minScale: 0.2,
    scaleSpeed: 1.1,
    pinch: true
}

const shadowProperties = {
    "context_target": {
        "object": [
            "set_object_property",
            "set_object_properties",
            "get_object_property",
            "modify_object_property",
            "invoke_constructor",
            "sleep"
        ]
    },
    "text": {
        "property": [
            "set_object_property",
            "set_object_properties",
            "get_object_property",
            "modify_object_property"
        ],
        "variable": [
            "for_loop"
        ],
        "name": [
            "get_context_object",
            "system_module",
        ]
    }
}

const toolboxBlockOverrides = {}

for (const [shadowType, inputs] of Object.entries(shadowProperties)) {
    for (const [inputName, blockTypes] of Object.entries(inputs)) {
        for (const blockType of blockTypes) {
            toolboxBlockOverrides[blockType] ??= ""

            toolboxBlockOverrides[blockType] += `
                <value name="${inputName}">
                    <shadow type="${shadowType}"></shadow>
                </value>
            `
        }
    }
}

function createToolbox() {
    const categories = new Map()

    for (const def of blockDefinitions) {
        if (!categories.has(def.category)) {
            categories.set(def.category, [])
        }

        categories.get(def.category).push(def.type)
    }

    let xml = "<xml>"

    xml += `
        <category
            name="Search Results"
            custom="SEARCH_RESULTS">
        </category>
    `

    for (const [category, blocks] of categories) {
        xml += `<category name="${category}">`

        for (const type of blocks) {
            const inner = toolboxBlockOverrides[type] ?? ""
            xml += `<block type="${type}">${inner}</block>`
        }

        xml += "</category>"
    }

    xml += "</xml>"

    return xml
}

const toolbox = createToolbox()

const darkTheme = Blockly.Theme.defineTheme("dark", {
    base: Blockly.Themes.Classic,
    componentStyles: {
        workspaceBackgroundColour: "#1e1e1e",
        toolboxBackgroundColour: "#252526",
        toolboxForegroundColour: "#ffffff",
        flyoutBackgroundColour: "#2d2d30",
        flyoutForegroundColour: "#ffffff",
        flyoutOpacity: 1,
        scrollbarColour: "#666",
        insertionMarkerColour: "#ffffff",
        insertionMarkerOpacity: 0.3,
        markerColour: "#ffffff",
        cursorColour: "#ffffff"
    }
})

const pages = new Map()
const pageNames = new Map()
const pageOutputs = new Map()

const pageTabs = document.getElementById("pageTabs")
let currentPage = null
let pageId = 0

const dropIndicator = document.createElement("div")
dropIndicator.id = "pageDropIndicator"
pageTabs.appendChild(dropIndicator)

function createPageTab(id) {
    const tab = document.createElement("div")
    tab.className = "pageTab"
    tab.dataset.id = id
    tab.draggable = true

    tab.addEventListener("dragstart", e => {
        e.dataTransfer.setData(
            "text/plain",
            id
        )

        tab.classList.add("dragging")
    })

    tab.addEventListener("dragend", () => {
        tab.classList.remove("dragging")
        dropIndicator.style.display = "none"
    })

    tab.addEventListener("dragover", e => {
        e.preventDefault()

        const rect = tab.getBoundingClientRect()

        dropIndicator.style.height = `${rect.height}px`
        dropIndicator.style.top = `${tab.offsetTop}px`

        const before = e.clientX < rect.left + rect.width / 2

        dropIndicator.style.display = "block"
        dropIndicator.style.left =
            `${before ? tab.offsetLeft : tab.offsetLeft + tab.offsetWidth}px`
    })

    tab.addEventListener("drop", e => {
        dropIndicator.style.display = "none"
        e.preventDefault()

        const draggedId = e.dataTransfer.getData("text/plain")

        if (draggedId === id) return

        reorderPages(draggedId, id, e)
    })

    const name = document.createElement("span")
    name.textContent = pageNames.get(id)

    name.ondblclick = e => {
        e.stopPropagation()

        const input = document.createElement("input")
        input.maxLength = 20
        input.value = pageNames.get(id)

        name.replaceWith(input)

        input.focus()
        input.select()

        const finish = () => {
            const value = input.value.trim()

            if (value) {
                pageNames.set(id, value)
            }

            name.textContent = pageNames.get(id)

            input.replaceWith(name)
        }

        input.addEventListener("blur", finish)

        input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                finish()
            }

            if (e.key === "Escape") {
                input.replaceWith(name)
            }
        })
    }

    const close = document.createElement("button")
    close.textContent = "×"

    tab.appendChild(name)
    tab.appendChild(close)

    tab.onclick = () => {
        switchPage(id)
    }
    close.onclick = async e => {
        e.stopPropagation()

        if (!await showConfirm(`Close ${pageNames.get(id)}?`)) {
            return
        }

        const tabArray = [...pageTabs.children]
        const index = tabArray.findIndex(
            tab => tab.dataset.id === id
        )

        const wasActive = currentPage === pages.get(id)

        pages.get(id).dispose()
        pages.delete(id)
        pageNames.delete(id)

        document.getElementById(id).remove()
        tab.remove()

        if (pages.size === 0) {
            pageId = 0
            createPage()
            return
        }

        if (wasActive) {
            const newTabs = [...pageTabs.children]

            const newIndex = Math.max(
                0,
                index - 1
            )

            const nextTab = newTabs[newIndex]

            if (nextTab) {
                switchPage(nextTab.dataset.id)
            }
        }
    }

    pageTabs.appendChild(tab)
}

function defineNewWorkspace(id) {
    const workspace = Blockly.inject(id, {
        toolbox,
        zoom
    })

    workspace.setTheme(darkTheme)
    registerSearchCallback(workspace)

    return workspace
}

function createPage() {
    const id = `page_${pageId++}`

    pageNames.set(id, `Page ${pageId}`)

    const div = document.createElement("div")
    div.id = id
    div.className = "blocklyPage"

    document
        .getElementById("pages")
        .appendChild(div)

    const workspace = defineNewWorkspace(id)

    pages.set(id, workspace)

    createPageTab(id)
    switchPage(id)

    Blockly.svgResize(workspace)

    return workspace
}

function switchPage(id) {
    for (const [pageId, workspace] of pages) {
        document
            .getElementById(pageId)
            .classList.toggle(
            "active",
            pageId === id
        )
    }

    for (const tab of pageTabs.children) {
        tab.classList.toggle(
            "active",
            tab.dataset.id === id
        )
    }

    currentPage = pages.get(id)

    if (currentPage) {
        Blockly.svgResize(currentPage)
        currentPage.markFocused()

        output.textContent =
            pageOutputs.get(currentPage) ?? ""

        Prism.highlightElement(output)
    }

    positionSearch()
}

document.getElementById("addPageBtn").onclick = () => {
    createPage()
}

(async () => {
    const hasAutosave = localStorage.getItem("jap_autosave")

    if (hasAutosave && await showConfirm("Restore autosaved project?")) {
        loadAutosave()
    } else {
        createPage()
    }
})()

const searchContainer = document.getElementById("toolboxSearchContainer");

function positionSearch() {
    const toolbox = currentPage.getToolbox()

    const width = Math.max(100, toolbox.getWidth() - 16)
    searchContainer.style.width = `${width}px`
}


window.addEventListener("resize", () => {
    Blockly.svgResize(currentPage)
    positionSearch()
})

function reorderPages(fromId, toId, event) {
    const fromTab = [...pageTabs.children].find(
        t => t.dataset.id === fromId
    )

    const toTab = [...pageTabs.children].find(
        t => t.dataset.id === toId
    )

    if (!fromTab || !toTab) return

    const rect = toTab.getBoundingClientRect()
    const insertAfter =
        event.clientX > rect.left + rect.width / 2

    if (insertAfter) {
        pageTabs.insertBefore(
            fromTab,
            toTab.nextSibling
        )
    } else {
        pageTabs.insertBefore(
            fromTab,
            toTab
        )
    }
}