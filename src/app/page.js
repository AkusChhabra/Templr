import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
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
                <input className={styles["proj-name"]} id="projName" type="text" placeholder="Untitled"/>
              </div>
            </div>
            <div className={styles["tb-row"]}>
              <div className={styles["tb-label"]}>Items</div>
              <div className={styles["tb-val"]} id="tbItems">0 folders · 0 files</div>
            </div>
            <div className={styles["tb-row"]}>
              <div className={styles["tb-label"]}>Library</div>
              <div className={styles["tb-val"]} id="tbLibrary">0 templates · 0 presets</div>
            </div>
          </div>
        </div>

        <div className={styles.toolbar}>
          <button className={`${styles.tbtn} ${styles.ghost}`} id="newBtn">↺ New</button>
          <button className={styles.tbtn} id="libBtn">▤ Library</button>
          <button className={styles.tbtn} id="savePresetBtn">＋ Save as preset</button>
          <button className={`${styles.tbtn} ${styles.primary}`} id="downloadBtn">↓ Download .zip</button>
        </div>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <div className={styles["panel-head"]}>
              <span className={styles.tag}>Structure</span>
              <span className={styles.tag} id="dropHint">drag rows to reorganize</span>
            </div>
            <div id="treeArea"></div>
          </div>

          <div className={styles.panel}>
            <div className={styles["panel-head"]}><span className={styles.tag}>Inspector</span></div>
            <div id="inspectorArea"></div>
          </div>
        </div>

        <footer className={styles.footerContainer}>Feel free to support us: </footer>
      </div>

      <div id="modalRoot"></div>
      <div className={styles.toast} id="toast"></div>
    </div>
  );
}
