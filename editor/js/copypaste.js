
let copiedBlockState = null

let mouseX = 0
let mouseY = 0

document.addEventListener("mousemove", e => {
    mouseX = e.clientX
    mouseY = e.clientY
})

const registry = Blockly.ShortcutRegistry.registry

registry.unregister(Blockly.ShortcutItems.names.COPY)
registry.unregister(Blockly.ShortcutItems.names.CUT)
registry.unregister(Blockly.ShortcutItems.names.PASTE)

registry.register({
    name: "custom_copy",
    preconditionFn: () => !!Blockly.common.getSelected(),
    callback: () => {
        const block = Blockly.common.getSelected()
        if (!block) return false

        copiedBlockState = Blockly.serialization.blocks.save(block)

        return true
    },
    keyCodes: [
        Blockly.ShortcutRegistry.registry.createSerializedKey(
            Blockly.utils.KeyCodes.C,
            [Blockly.utils.KeyCodes.CTRL]
        )
    ]
})

registry.register({
    name: "custom_cut",
    preconditionFn: () => {
        const block = Blockly.common.getSelected()
        return !!block && block.isDeletable()
    },
    callback: () => {
        const block = Blockly.common.getSelected()
        if (!block) return false

        copiedBlockState = Blockly.serialization.blocks.save(block)
        block.checkAndDelete()

        return true
    },
    keyCodes: [
        Blockly.ShortcutRegistry.registry.createSerializedKey(
            Blockly.utils.KeyCodes.X,
            [Blockly.utils.KeyCodes.CTRL]
        )
    ]
})

registry.register({
    name: "custom_paste",
    preconditionFn: () => !!copiedBlockState && !!currentPage,
    callback: () => {
        if (!copiedBlockState || !currentPage) return false

        const metrics = currentPage.getMetrics()
        const scale = currentPage.scale

        const x = (mouseX - metrics.absoluteLeft) / scale + metrics.viewLeft
        const y = (mouseY - metrics.absoluteTop) / scale + metrics.viewTop

        const state = structuredClone(copiedBlockState)
        state.x = x
        state.y = y

        const newBlock = Blockly.serialization.blocks.append(state, currentPage)
        Blockly.common.setSelected(newBlock)

        return true
    },
    keyCodes: [
        Blockly.ShortcutRegistry.registry.createSerializedKey(
            Blockly.utils.KeyCodes.V,
            [Blockly.utils.KeyCodes.CTRL]
        )
    ]
})