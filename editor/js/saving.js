function isProjectEmpty() {
    for (const workspace of pages.values()) {
        if (workspace.getAllBlocks(false).length > 0) {
            return false
        }
    }
    return true
}

function saveProject() {
    if (isProjectEmpty()) {
        logger("Empty project can't be saved.", "notice")
        return
    }

    try {
        localStorage.setItem(
            "jap_autosave",
            JSON.stringify(serializeProject())
        )

        logger("Project saved.", "success")
    } catch (err) {
        logger(`Autosave failed: ${err.message}`, "error")
    }
}

setInterval(saveProject, 2 * 60 * 1000)

function loadAutosave() {
    const raw = localStorage.getItem("jap_autosave")
    if (!raw) return false

    try {
        const project = JSON.parse(raw)

        deserializeProject(project)

        logger("Restored project from an autosave.", "success")
        return true
    } catch (err) {
        logger(`Failed to restore autosave: ${err.message}`, "error")
        return false
    }
}

function serializeProject() {
    return {
        pageId,
        currentPageId: [...pages.entries()].find(([, ws]) => ws === currentPage)?.[0] ?? null,
        pages: [...pageTabs.children]
            .filter(tab => tab.classList.contains("pageTab"))
            .map(tab => {
                const id = tab.dataset.id
                return {
                    id,
                    name: pageNames.get(id),
                    state: Blockly.serialization.workspaces.save(pages.get(id))
                }
            })
    }
}

function deserializeProject(project) {
    for (const workspace of pages.values()) {
        workspace.dispose()
    }

    pages.clear()
    pageNames.clear()

    document.getElementById("pages").innerHTML = ""
    pageTabs.innerHTML = ""

    pageId = project.pageId ?? 0

    for (const page of project.pages) {
        const id = page.id ?? `page_${pageId++}`

        pageNames.set(id, page.name)

        const div = document.createElement("div")
        div.id = id
        div.className = "blocklyPage"

        document.getElementById("pages").appendChild(div)

        const workspace = defineNewWorkspace(id)

        pages.set(id, workspace)

        createPageTab(id)

        Blockly.serialization.workspaces.load(
            page.state,
            workspace
        )
    }

    const firstId =
        project.currentPageId ??
        project.pages[0]?.id ??
        pages.keys().next().value

    if (firstId) {
        switchPage(firstId)
    }

    positionSearch()
}