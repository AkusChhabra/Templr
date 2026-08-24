

export async function init() {
    const [savedTree, savedTemplates, savedPresets] = await Promise.all([
        storageGet("workspace-tree", null),
        storageGet("templates", []),
        storageGet("presets", []),
    ]);

    if (savedTree && savedTree.id && savedTree.type === "folder") {
        tree = savedTree;
    } else {
        tree = defaultTree();
    }
    templates = Array.isArray(savedTemplates) ? savedTemplates : [];
    presets = Array.isArray(savedPresets) ? savedPresets : [];

    expanded = new Set([tree.id]);
    renderAll();

    if (!hasStorage) {
        showToast("Storage unavailable in this view — changes won't persist between visits", "bad");
    }
}