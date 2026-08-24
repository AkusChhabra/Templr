"use client";
import styles from "../page.module.css";
import { extOf } from "@/lib/utils";

const exts = new Set(["xlsx", "docx", "pptx"]);

export default function Inspector({ tree, selectedId, onChange, onAdd, onDelete, templates = [] }) {
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

	function pathTo(node, id, path = []) {
		if (node.id === id) return [...path, node];
		if (node.type === "folder") {
			for (const child of node.children) {
				const result = pathTo(child, id, [...path, node]);
				if (result) return result;
			}
		}
		return null;
	}

	const node = selectedId ? findNode(tree, selectedId) : null;
	if (!node) {
		return (
			<div className={styles["insp-empty"]}>
				<b>Nothing selected</b>
				Click a folder or file in the tree to edit it.
			</div>
		);
	}

	const path = pathTo(tree, node.id) || [];
	const extension = extOf(node.name);
	const stats = { folders: 0, files: 0 };

	function count(item) {
		if (item.type === "folder") {
			stats.folders += 1;
			item.children.forEach(count);
		} else {
			stats.files += 1;
		}
	}

	if (node.type === "folder") node.children.forEach(count);

	return (
		<div>
			<div className={styles.breadcrumb}>{path.map((item) => item.name || "(untitled)").join(" / ")}</div>
			<div className={styles.field}>
				<label className={styles.f}>Name</label>
				<input className={styles.nameInput} type="text" value={node.name} onChange={(event) => onChange({ name: event.target.value })} placeholder={node.type === "folder" ? "folder-name" : "file-name.ext"}/>
			</div>
			{node.type === "folder" && (
				<div className={styles["kind-badge"]}>
					<span className={`${styles.sw} ${styles.folder}`} />
					{stats.folders} folders, {stats.files} files inside
				</div>
			)}
			{node.type === "file" && (
				<>
					<div className={styles["kind-badge"]}>
						<span className={`${styles["badge-swatch"]} ${styles["badge-file"]}`} />
						{extension ? `.${extension} file` : "No extension file"}
					</div>
					{exts.has(extension) && (
						<div className={styles["office-note"]}>
							This will export as a valid, blank .{extension} document if left empty below. Type content in the editor and it will be saved as raw text instead.
						</div>
					)}
					<div className={styles.field}>
						<label className={styles.f}>Content</label>
						<textarea className={styles.contentBox} value={node.content || ""} onChange={(event) => onChange({ content: event.target.value })} placeholder="File content..." spellCheck={false} />
					</div>
					<div className={styles.field}>
						<label className={styles.f}>Templates</label>
						<select className={styles.templateSelect} defaultValue="">
							<option value="">{templates.length ? "Insert from template..." : "No saved templates yet"}</option>
							{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
						</select>
						<button className={`${styles["small-btn"]} ${styles.templateSave}`} type="button">＋ Save current content as template</button>
					</div>
				</>
			)}
			{node.type === "folder" && (
				<div className={styles["tmpl-row"]}>
					<button className={styles["small-btn"]} onClick={() => onAdd("folder", node.id)}>＋ Add folder here</button>
					<button className={styles["small-btn"]} onClick={() => onAdd("file", node.id)}>＋ Add file here</button>
				</div>
			)}
			<button className={styles["delete-node-btn"]} disabled={node.id === tree.id} onClick={() => onDelete(node.id)}>
				{node.id === tree.id ? "Root folder cannot be deleted" : `Delete this ${node.type}`}
			</button>
		</div>
	);
}
