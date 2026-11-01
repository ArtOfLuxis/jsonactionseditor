const modalOverlay = document.getElementById("modalOverlay")
const modal = document.getElementById("modal")
const modalTitle = document.getElementById("modalTitle")
const modalButtons = document.getElementById("modalButtons")
const modalClose = document.getElementById("modalClose")

const exportBtn = document.getElementById("exportBtn")
const importBtn = document.getElementById("importBtn")

function showModal(title, buttons) {
    modalTitle.textContent = title
    modalMessage.textContent = ""

    modalButtons.classList.remove("horizontal")
    modalClose.classList.remove("hidden")

    modalButtons.replaceChildren()

    for (const { text, onclick } of buttons) {
        const button = document.createElement("button")
        button.textContent = text

        button.onclick = async () => {
            try {
                await onclick()
            } finally {
                modalOverlay.classList.add("hidden")
            }
        }

        modalButtons.appendChild(button)
    }

    modalOverlay.classList.remove("hidden")
}

modalClose.onclick = () => {
    modalOverlay.classList.add("hidden")
}

modalOverlay.onclick = e => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.add("hidden")
    }
}

exportBtn.onclick = () => {
    showModal("Export", [
        { text: "Project (.jap)", onclick: exportProject },
        { text: "Workspace (.jaw)", onclick: exportWorkspace },
        { text: "JSON", onclick: exportJson },
        { text: "Optimized JSON", onclick: exportOptimizedJson },
        { text: "Autosave", onclick: exportAutosave },
        { text: "Copy JSON", onclick: copyJson },
    ])
}

importBtn.onclick = () => {
    showModal("Import", [
        { text: "Project (.jap)", onclick: importProject },
        { text: "Workspace (.jaw)", onclick: importWorkspace },
        { text: "JSON", onclick: importJson },
        { text: "Autosave", onclick: importAutosave },
        { text: "Paste JSON", onclick: pasteJson },
    ])
}

const modalMessage = document.getElementById("modalMessage")

function showConfirm(message) {
    return new Promise(resolve => {
        modalTitle.textContent = "Confirm"
        modalMessage.textContent = message

        modalButtons.replaceChildren()

        modalButtons.classList.add("horizontal")
        modalClose.classList.add("hidden")

        const yes = document.createElement("button")
        yes.textContent = "Yes"

        const no = document.createElement("button")
        no.textContent = "No"

        const close = result => {
            modalOverlay.classList.add("hidden")
            modalButtons.classList.remove("horizontal")
            modalClose.classList.remove("hidden")
            resolve(result)
        }

        yes.onclick = () => close(true)
        no.onclick = () => close(false)

        modalOverlay.onclick = e => {
            if (e.target === modalOverlay) {
                close(false)
            }
        }

        modalButtons.append(yes, no)
        modalOverlay.classList.remove("hidden")
    })
}