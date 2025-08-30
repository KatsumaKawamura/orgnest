// lib/modalInertStack.ts
// モーダルの「最前面以外」を inert/aria-hidden にする共通マネージャ（HMR安全）

type InertMgr = {
  stack: HTMLElement[];
  register: (host: HTMLElement) => () => void;
  bringToTop: (host: HTMLElement) => void;
  update: () => void;
};

const KEY = "__modal_inert_mgr__";

function createManager(): InertMgr {
  const mgr: InertMgr = {
    stack: [],
    update() {
      if (typeof document === "undefined") return;

      // DOM 上で“最後に登録され、まだ接続されている要素”を最前面として扱う
      const top = [...mgr.stack].reverse().find((el) => el.isConnected) || null;
      const kids = Array.from(document.body.children);
      const topIdx = top ? kids.indexOf(top) : -1;

      for (let i = 0; i < kids.length; i++) {
        const n = kids[i] as HTMLElement;
        const shouldInert = top && i < topIdx;
        const mine = n.hasAttribute("data-inert-by-modal");

        if (shouldInert) {
          if (!mine) {
            // 既存の inert を壊さないよう、自分の印をつけて付与
            n.setAttribute("inert", "");
            n.setAttribute("aria-hidden", "true");
            n.setAttribute("data-inert-by-modal", "");
          }
        } else {
          // 自分が付けた分だけ外す（他所が付けた inert には触れない）
          if (mine) {
            n.removeAttribute("inert");
            n.removeAttribute("aria-hidden");
            n.removeAttribute("data-inert-by-modal");
          }
        }
      }
    },
    register(host: HTMLElement) {
      if (!host) return () => {};
      const i = mgr.stack.indexOf(host);
      if (i >= 0) mgr.stack.splice(i, 1);
      mgr.stack.push(host);
      mgr.update();

      // アンレジスタ
      return () => {
        const j = mgr.stack.indexOf(host);
        if (j >= 0) mgr.stack.splice(j, 1);
        mgr.update();
      };
    },
    bringToTop(host: HTMLElement) {
      const i = mgr.stack.indexOf(host);
      if (i >= 0) {
        mgr.stack.splice(i, 1);
        mgr.stack.push(host);
        mgr.update();
      }
    },
  };
  return mgr;
}

declare global {
  interface Window {
    [KEY]?: InertMgr;
  }
}

export const modalInertStack: InertMgr =
  (typeof window !== "undefined" && (window as any)[KEY]) ||
  (typeof window !== "undefined" && ((window as any)[KEY] = createManager())) ||
  createManager();
