export function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return ("id-" + Math.random().toString(36).slice(2) + Date.now().toString(36));
}

export function sanitizeName(name) {
    return (name || "").replace(/[\\/:*?"<>|]/g, "").trim();
}

export function extOf(name) {
    const parts = (name || "").split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

export function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
        for (const key in attrs) {
            const v = attrs[key];
            if (v === undefined || v === null) continue;
            if (key === "class") node.className = v;
            else if (key === "text") node.textContent = v;
            else if (key === "style") node.setAttribute("style", v);
            else if (key.slice(0, 2) === "on" && typeof v === "function")
                node.addEventListener(key.slice(2), v);
            else node.setAttribute(key, v);
        }
    }
    if (children) {
        children.forEach((c) => {
            if (c === null || c === undefined) return;
            node.appendChild(
                typeof c === "string" ? document.createTextNode(c) : c,
            );
        });
    }
    return node;
}

export function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

export function debounce(fn, ms) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

export function showToast(msg, kind) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.className = "toast show" + (kind ? " " + kind : "");
    clearTimeout(showToast._h);
    showToast._h = setTimeout(() => {
        t.className = "toast";
    }, 2600);
}