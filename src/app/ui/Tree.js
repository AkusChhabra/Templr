"use client";
import styles from "../page.module.css";
import { useState } from "react";

export default function Tree({ tree, onAdd, onDelete, onSelect, onMove }) {
  const [expanded, setExpanded] = useState(new Set([tree.id]));
  const [selectedId, setSelectedId] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [dropInfo, setDropInfo] = useState(null);

  function toggleFolder(id) {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function isDescendant(node, id) {
    if (node.id === id) return true;
    return node.type === "folder" && node.children.some((child) => isDescendant(child, id));
  }

  function handleDragStart(event, node) {
    setDraggedId(node.id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", node.id);
  }

  function handleDragOver(event, node) {
    event.preventDefault();
    if (!draggedId || draggedId === node.id) return;
    const draggedNode = findNode(tree, draggedId);
    if (!draggedNode || isDescendant(draggedNode, node.id)) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientY - bounds.top) / bounds.height;
    const position = ratio < 0.25 ? "before" : ratio > 0.75 ? "after" : node.type === "folder" ? "inside" : "after";
    setDropInfo({ targetId: node.id, position });
  }

  function handleDrop(event) {
    event.preventDefault();
    if (draggedId && dropInfo) onMove?.(draggedId, dropInfo.targetId, dropInfo.position);
    setDraggedId(null);
    setDropInfo(null);
  }

  function handleRootDragOver(event) {
    event.preventDefault();
    if (!draggedId || draggedId === tree.id) return;
    setDropInfo({ targetId: tree.id, position: "inside" });
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDropInfo(null);
  }

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

  function buildNodeRow(node, depth = 0) {
    const isFolder = node.type === "folder";
    const isOpen = expanded.has(node.id);

    return (
      <div key={node.id}>
        <div
          className={`${styles["node-row"]} ${selectedId === node.id ? styles.selected : ""} ${draggedId === node.id ? styles.dragging : ""} ${dropInfo?.targetId === node.id ? styles[`drop-${dropInfo.position}`] : ""}`}
          style={{ paddingLeft: `${10 + depth * 18}px` }}
          draggable
          onDragStart={(event) => handleDragStart(event, node)}
          onDragOver={(event) => handleDragOver(event, node)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onClick={() => {
            setSelectedId(node.id);
            onSelect?.(node.id);
          }}
        >
          <span
            className={`${styles.chev} ${isFolder ? (isOpen ? styles.open : "") : styles.leaf}`}
            onClick={(event) => {
                event.stopPropagation();
                toggleFolder(node.id);
            }}
          >
            ▸
          </span>

          <span className={`${styles["node-icon"]} ${styles[node.type]}`} />

          <span className={`${styles["node-name"]} ${!node.name ? styles.untitled : ""}`}>
            {node.name ||
              (isFolder ? "(untitled folder)" : "(untitled file)")}
          </span>

          <div className={styles["row-actions"]}>
            {isFolder && (
              <>
              <button
                title="Add folder"
                onClick={(event) => {
                  event.stopPropagation();
                  onAdd("folder", node.id);
                }}
              >
                ＋▤
              </button>
              <button
                title="Add file"
                onClick={(event) => {
                  event.stopPropagation();
                  onAdd("file", node.id);
                }}
              >
                ＋▫
              </button>
              </>
            )}
            <button
              className={styles.del}
              title="Delete"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(node.id);
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {isFolder &&
          isOpen &&
          node.children.map((child) => buildNodeRow(child, depth + 1))}
      </div>
    );
  }

  if (tree.children.length === 0) {
    return (
      <div className={styles["empty-state"]}>
        <div className={styles.big}>
          This structure is empty. Add your first folder or file.
        </div>

        <div className={styles["estart-btns"]}>
          <button className={styles.tbtn} onClick={() => onAdd("folder", tree.id)}>
            ＋ Folder
          </button>

          <button className={styles.tbtn} onClick={() => onAdd("file", tree.id)}>
            ＋ File
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {tree.children.map((node) => buildNodeRow(node))}
      <div
        className={`${styles["root-drop-zone"]} ${dropInfo?.targetId === tree.id ? styles["drop-inside"] : ""}`}
        onDragOver={handleRootDragOver}
        onDrop={handleDrop}
      />
    </div>
  );
}