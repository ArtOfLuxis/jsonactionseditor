
const exportWorkspace = () => {
    const state = Blockly.serialization.workspaces.save(currentPage)

    const blob = new Blob(
        [JSON.stringify(state, null, 4)],
        { type: "application/json" }
    )

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "workspace.jaw"
    a.click()

    URL.revokeObjectURL(url)

    logger("Workspace exported.", "success");
}

const importWorkspaceFile = document.getElementById("importWorkspaceFile");

const importWorkspace = () => {
    importWorkspaceFile.click()
}

importWorkspaceFile.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return;

    if (!await showConfirm(`Import JSON from Workspace ${file.name}? Current workspace will be replaced.`)) {
        return
    }

    try {
        const text = await file.text()
        const state = JSON5.parse(text)

        currentPage.clear()
        Blockly.serialization.workspaces.load(state, currentPage)

        currentPage.scrollCenter()

        logger("Workspace imported.", "success")
    } catch (err) {
        logger(`Import failed: ${err.message}`, "error")
    }

    importWorkspaceFile.value = ""
}

const exportJson = () => {
    shouldOptimize = false
    const json = JSON.stringify(compileWorkspaceChains(currentPage), null, 2)

    const blob = new Blob(
        [json],
        { type: "application/json" }
    )

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "actions_unoptimized.json"
    a.click()

    URL.revokeObjectURL(url)

    logger("JSON exported (without optimization).", "success")
}

const exportOptimizedJson = () => {
    shouldOptimize = true
    const json = JSON.stringify(compileWorkspaceChains(currentPage), null, 2)

    const blob = new Blob(
        [json],
        { type: "application/json" }
    )

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "actions_optimized.json"
    a.click()

    URL.revokeObjectURL(url)

    logger("JSON exported (optimized).", "success")
}

const importJsonFile = document.getElementById("importJsonFile")

const importJson = () => {
    importJsonFile.click()
}

importJsonFile.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!await showConfirm(`Import JSON from JSON ${file.name}? Current workspace will be replaced.`)) {
        return
    }

    try {
        const text = await file.text()
        const json = JSON5.parse(text)

        const chains = normalizeJsonChains(json)

        currentPage.clear()

        let x = 100

        for (const {name, chain} of chains) {
            let first = null
            let previous = null

            if (name) {
                const start = newBlock("start_block", currentPage)
                start.setFieldValue(name, "name")
                start.render()

                first = start
                previous = start
            }

            for (const action of chain) {
                const block = createBlockFromJson(action, currentPage)
                if (!block) continue

                block.render()

                if (!first) {
                    first = block
                }

                if (previous) {
                    previous.nextConnection.connect(block.previousConnection)
                }

                previous = block
            }

            if (first) {
                first.moveBy(x, 100)
                x += first.getHeightWidth().width + 80
            }
        }

        currentPage.scrollCenter()

        logger("JSON imported.", "success")
    }
    catch (err) {
        logger(`JSON import failed: ${err.message}`, "error")
    }

    importJsonFile.value = ""
}

const sidebar = document.getElementById("sidebar")
const resizer = document.getElementById("sidebarResizer")

let resizing = false

resizer.addEventListener("mousedown", event => {
    event.preventDefault()
    resizing = true
});

document.addEventListener("mousemove", event => {
    if (!resizing) return

    const width = Math.min(900, Math.max(520, window.innerWidth - event.clientX))
    sidebar.style.width = `${width}px`

    Blockly.svgResize(currentPage)
})

document.addEventListener("mouseup", event => {
    resizing = false
})

const copyJson = async () => {
    const json = JSON5.parse(output.textContent)

    const text = Object.entries(json)
        .map(([name, actions]) =>
            `${JSON.stringify(name)}: ${JSON.stringify(actions, null, 2)}`
        )
        .join(",\n")

    await navigator.clipboard.writeText(text)

    logger("JSON copied to clipboard.", "success")
}
document.getElementById("copyJsonBtn").onclick = copyJson

const pasteJson = async () => {
    try {
        let text = (await navigator.clipboard.readText()).trim()

        if (!text.startsWith("{")) {
            text = `{${text}`
        }
        if (!text.endsWith("{")) {
            text = `${text}}`
        }

        const json = JSON5.parse(text)

        if (!await showConfirm("Import JSON from clipboard? It will be pasted on top, without clearing the page")) {
            return
        }
        const chains = normalizeJsonChains(json)

        let x = 100

        for (const {name, chain} of chains) {
            let first = null
            let previous = null

            if (name) {
                const start = newBlock("start_block", currentPage)
                start.setFieldValue(name, "name")
                start.render()

                first = start
                previous = start
            }

            for (const action of chain) {
                const block = createBlockFromJson(action, currentPage)
                if (!block) continue

                block.render()

                if (!first) {
                    first = block
                }

                if (previous) {
                    previous.nextConnection.connect(block.previousConnection)
                }

                previous = block
            }

            if (first) {
                first.moveBy(x, 100)
                x += first.getHeightWidth().width + 80
            }
        }

        currentPage.scrollCenter()

        logger("JSON pasted and imported.", "success")
    }
    catch (err) {
        logger(`JSON paste failed: ${err.message}`, "error")
    }
}

const exportProject = () => {
    const project = serializeProject()

    const blob = new Blob(
        [JSON.stringify(project, null, 4)],
        { type: "application/json" }
    )

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "project.jap"
    a.click()

    URL.revokeObjectURL(url)

    logger("Project exported.", "success")
}

const importProjectFile = document.getElementById("importProjectFile")

const importProject = () => {
    importProjectFile.click()
}

importProjectFile.onchange = async e => {
    const file = e.target.files[0]
    if (!file) return

    if (!await showConfirm(`Import project ${file.name}? ALL pages will be replaced.`)) {
        return
    }

    try {
        const text = await file.text()
        const project = JSON5.parse(text)

        deserializeProject(project)

        logger("Project imported.", "success")
    }
    catch (err) {
        logger(`Project import failed: ${err.message}`, "error")
    }

    importProjectFile.value = ""
}

const exportAutosave = () => {
    const autosave = localStorage.getItem("jap_autosave")

    if (!autosave) {
        logger("No autosave found.", "warn")
        return
    }

    const blob = new Blob(
        [autosave],
        { type: "application/json" }
    )

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "autosave.jap"
    a.click()

    URL.revokeObjectURL(url)

    logger("Last autosave exported.", "success")
}

const importAutosave = async () => {
    const autosave = localStorage.getItem("jap_autosave")


    if (!autosave) {
        logger("No autosave found.", "warn")
        return
    }

    console.log(autosave)

    if (!await showConfirm(`Import project from current autosave? ALL pages will be replaced.`)) {
        return
    }

    loadAutosave()
}

function normalizeJsonChains(json) {
    if (!json || typeof json !== "object" || Array.isArray(json)) {
        return []
    }

    return Object.entries(json).map(([name, chain]) => ({
        name,
        chain: Array.isArray(chain) ? chain : [chain]
    }))
}