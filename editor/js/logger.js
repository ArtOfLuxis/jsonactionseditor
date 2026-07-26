
const log = document.getElementById("log")

function logger(message, type = "info") {
    const line = document.createElement("div")

    line.classList.add(type)

    const icons = {
        notice: "🛈 ",
        success: "✓ ",
        warn: "⚠ ",
        error: "✖ "
    }

    line.textContent = `${icons[type] ?? ""}${message}`

    log.appendChild(line)
    log.scrollTop = log.scrollHeight
}

function clearLog() {
    log.replaceChildren()
}