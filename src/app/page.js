import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div>
      <div class={styles.wrap}>
        <div class={styles.header}>
          <div class={styles.titleCluster}>
            <div class={styles.kicker}>
              <span class={styles.dot}></span> FOLDER &amp; FILE BUILDER
            </div>
            <h1>Templr <span>Studio</span></h1>
            <div class={styles.sub}>Design your own folders as you see fit.</div>
          </div>
          <div class={styles.titleBlock}>
            <div class={styles["tb-row"]}>
              <div class={styles["tb-label"]}>Project</div>
              <div class={styles["tb-val"]}>
                <input class={styles["proj-name"]} id="projName" type="text" placeholder="Untitled"/>
              </div>
            </div>
            <div class={styles["tb-row"]}>
              <div class={styles["tb-label"]}>Items</div>
              <div class={styles["tb-val"]} id="tbItems">0 folders · 0 files</div>
            </div>
            <div class={styles["tb-row"]}>
              <div class={styles["tb-label"]}>Library</div>
              <div class="tb-val" id="tbLibrary">0 templates · 0 presets</div>
            </div>
          </div>
        </div>

        <div class={styles.toolbar}>
          <button class={`${styles.tbtn} ${styles.ghost}`} id="newBtn">↺ New</button>
          <button class={styles.tbtn} id="libBtn">▤ Library</button>
          <button class={styles.tbtn} id="savePresetBtn">＋ Save as preset</button>
          <button class={`${styles.tbtn} ${styles.primary}`} id="downloadBtn">↓ Download .zip</button>
        </div>

        <div class={styles.grid}>
          <div class={styles.panel}>
            <div class={styles["panel-head"]}>
              <span class={styles.tag}>Structure</span>
              <span class={styles.tag} id="dropHint">drag rows to reorganize</span>
            </div>
            <div id="treeArea"></div>
          </div>

          <div class={styles.panel}>
            <div class={styles["panel-head"]}><span class={styles.tag}>Inspector</span></div>
            <div id="inspectorArea"></div>
          </div>
        </div>

        <footer class={styles.footerContainer}>Feel free to support us: </footer>
      </div>

      <div id="modalRoot"></div>
      <div class={styles.toast} id="toast"></div>
    </div>
  );
}
