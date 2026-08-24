"use client";
import styles from "./page.module.css";
import Tree from "./ui/Tree";
import Inspector from "./ui/Inspector";
import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";


export default function Home() {

  const initialTree = {
    id: "root",
    type: "folder",
    name: "MyProject",
    children: [],
  };
  const [tree, setTree] = useState(initialTree);
  const [selectedId, setSelectedId] = useState(null);
  const [templates] = useState([]);
  const hasLoadedStorage = useRef(false);

  useEffect(() => {
    const loadSavedTree = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("workspace-tree");
        if (saved) setTree(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem("workspace-tree");
      } finally {
        hasLoadedStorage.current = true;
      }
    }, 0);

    return () => window.clearTimeout(loadSavedTree);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage.current) return;
    window.localStorage.setItem("workspace-tree", JSON.stringify(tree));
  }, [tree]);

  function handleNew() {
    setTree({
      id: "root",
      type: "folder",
      name: "MyProject",
      children: [],
    });
    setSelectedId(null);
  }

  async function handleDownload() {
    const zip = new JSZip();
    const rootName = sanitizeName(tree.name) || "project";
    const rootFolder = zip.folder(rootName);

    function addNodeToZip(folder, node) {
      if (node.type === "folder") {
        const targetFolder = node.id === tree.id ? folder : folder.folder(sanitizeName(node.name) || "untitled-folder");
        if (node.children.length === 0 && node.id !== tree.id) targetFolder.file(".gitkeep", "");
        node.children.forEach((child) => addNodeToZip(targetFolder, child));
        return;
      }

      folder.file(sanitizeName(node.name) || "untitled-file", node.content || "");
    }

    function countExportableItems(node) {
      if (node.type === "file") return 1;
      return node.children.reduce((total, child) => total + countExportableItems(child), 0);
    }

    if (countExportableItems(tree) === 0 && tree.children.length === 0) return;

    addNodeToZip(rootFolder, tree);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${rootName}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function sanitizeName(name) {
    return (name || "").replace(/[\\/:*?"<>|]/g, "").trim();
  }

  function handleAdd(type, parentId) {
    const newItem = {
      id: crypto.randomUUID(),
      type,
      name: "",
      ...(type === "folder" ? { children: [] } : { content: "" }),
    };

    function addToNode(node) {
      if (node.id === parentId && node.type === "folder") {
        return { ...node, children: [...node.children, newItem] };
      }

      if (node.type !== "folder") return node;

      return {
        ...node,
        children: node.children.map(addToNode),
      };
    }

    setTree(addToNode);
    setSelectedId(newItem.id);
  }

  function handleDelete(nodeId) {
    if (nodeId === tree.id) return;

    function removeFromNode(node) {
      if (node.type !== "folder") return node;

      return {
        ...node,
        children: node.children
          .filter((child) => child.id !== nodeId)
          .map(removeFromNode),
      };
    }

    setTree(removeFromNode);
    setSelectedId((current) => (current === nodeId ? null : current));
  }

  function handleMove(draggedId, targetId, position) {
    if (draggedId === tree.id || draggedId === targetId) return;

    function findNode(node, id) {
      if (node.id === id) return node;
      if (node.type === "folder") {
        for (const child of node.children) {
          const found = findNode(child, id);
          if (found) return found;
        }
      }
      return null;
    }

    function isDescendant(node, id) {
      return node.id === id || (node.type === "folder" && node.children.some((child) => isDescendant(child, id)));
    }

    const draggedNode = findNode(tree, draggedId);
    if (!draggedNode || isDescendant(draggedNode, targetId)) return;

    let movedNode = null;
    function removeNode(node) {
      if (node.type !== "folder") return node;
      const remaining = [];
      for (const child of node.children) {
        if (child.id === draggedId) movedNode = child;
        else remaining.push(removeNode(child));
      }
      return { ...node, children: remaining };
    }

    const withoutDragged = removeNode(tree);
    if (!movedNode) return;

    function insertNode(node) {
      if (node.id === targetId) {
        if (position === "inside" && node.type === "folder") {
          return { ...node, children: [...node.children, movedNode] };
        }
        return node;
      }
      if (node.type !== "folder") return node;
      const targetIndex = node.children.findIndex((child) => child.id === targetId);
      if (targetIndex !== -1 && position !== "inside") {
        const insertAt = position === "before" ? targetIndex : targetIndex + 1;
        const children = [...node.children];
        children.splice(insertAt, 0, movedNode);
        return { ...node, children };
      }
      return { ...node, children: node.children.map(insertNode) };
    }

    setTree(insertNode(withoutDragged));
  }

  function handleChange(changes) {
    function updateNode(node) {
      if (node.id === selectedId) return { ...node, ...changes };
      if (node.type !== "folder") return node;
      return { ...node, children: node.children.map(updateNode) };
    }

    setTree(updateNode);
  }

  function countItems(node, result = { folders: 0, files: 0 }) {
    if (node.type === "folder") {
      if (node.id !== tree.id) result.folders += 1;
      node.children.forEach((child) => countItems(child, result));
    } else {
      result.files += 1;
    }
    return result;
  }

  const stats = countItems(tree);

  return (
    <div>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.titleCluster}>
            <div className={styles.kicker}>
              <span className={styles.dot}></span> FOLDER &amp; FILE BUILDER
            </div>
            <h1>Templr <span>Studio</span></h1>
            <div className={styles.sub}>Design your own folders as you see fit.</div>
          </div>
          <div className={styles.titleBlock}>
            <div className={styles["tb-row"]}>
              <div className={styles["tb-label"]}>Project</div>
              <div className={styles["tb-val"]}>
                <input className={styles["proj-name"]} id="projName" type="text" value={tree.name} onChange={(event) => setTree((current) => ({ ...current, name: event.target.value }))} placeholder="Untitled"/>
              </div>
            </div>
            <div className={styles["tb-row"]}>
              <div className={styles["tb-label"]}>Items</div>
              <div className={styles["tb-val"]} id="tbItems">{stats.folders} folders · {stats.files} files</div>
            </div>
            <div className={styles["tb-row"]}>
              <div className={styles["tb-label"]}>Library</div>
              <div className={styles["tb-val"]} id="tbLibrary">0 templates · 0 presets</div>
            </div>
          </div>
        </div>

        <div className={styles.toolbar}>
          <button className={`${styles.tbtn} ${styles.ghost}`} id="newBtn" onClick={handleNew}>↺ New</button>
          <button className={styles.tbtn} id="libBtn">▤ Library</button>
          <button className={styles.tbtn} id="savePresetBtn">＋ Save as preset</button>
          <button className={`${styles.tbtn} ${styles.primary}`} id="downloadBtn" onClick={handleDownload}>↓ Download .zip</button>
        </div>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <div className={styles["panel-head"]}>
              <span className={styles.tag}>Structure</span>
              <span className={styles.tag} id="dropHint">drag rows to reorganize</span>
            </div>
            <Tree tree={tree} onAdd={handleAdd} onDelete={handleDelete} onSelect={setSelectedId} onMove={handleMove} />
          </div>

          <div className={styles.panel}>
            <div className={styles["panel-head"]}><span className={styles.tag}>Inspector</span></div>
            <div className={styles.inspectorArea}>
              <Inspector tree={tree} selectedId={selectedId} onChange={handleChange} onAdd={handleAdd} onDelete={handleDelete} templates={templates} />
            </div>
          </div>
        </div>

        <footer className={styles.footerContainer}>Feel free to support us: </footer>
      </div>

      <div id="modalRoot"></div>
      <div className={styles.toast} id="toast"></div>
    </div>
  );
}
