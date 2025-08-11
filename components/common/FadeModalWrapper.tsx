// @/components/common/FadeModalWrapper.tsx
"use client";
import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
  useContext,
  isValidElement,
  cloneElement,
  ReactElement,
  Ref,
} from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useModalFocus } from "@/hooks/useModalFocus";
import { useFocusTrap } from "@/hooks/useFocusTrap";

type Ctx = { close: () => void };
const FadeModalContext = createContext<Ctx | null>(null);
export const useFadeModal = () => {
  const ctx = useContext(FadeModalContext);
  if (!ctx)
    throw new Error("useFadeModal must be used inside <FadeModalWrapper>");
  return ctx;
};

interface FadeModalWrapperProps {
  children: ReactNode;
  onClose: () => void;
  openDelay?: number;
  durationOpen?: number;
  easingOpen?: string;
  durationClose?: number;
  easingClose?: string;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  enterSubmits?: boolean;
  labelledBy?: string;
  describedBy?: string;
  role?: "dialog" | "alertdialog";
  /** 子要素を“そのまま”パネル本体として扱う（ref/ARIA/handlers を注入） */
  asChild?: boolean;
}

/** 子/親の ref を合成 */
function composeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else {
        try {
          (ref as any).current = node;
        } catch {}
      }
    }
  };
}

// 入力候補（useArrowFormNav と揃える）
const FIELDS_SELECTOR = [
  'input:not([type="hidden"]):not([disabled]):not([readonly])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(",");

const isUsable = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const hidden =
    (rect.width === 0 && rect.height === 0 && el.offsetParent === null) ||
    getComputedStyle(el).visibility === "hidden";
  const disabled =
    (el as any).disabled === true ||
    el.getAttribute("aria-disabled") === "true";
  return !hidden && !disabled;
};

const setCaretToEnd = (el: HTMLElement) => {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const len = el.value?.length ?? 0;
    try {
      el.setSelectionRange(len, len);
    } catch {}
  }
};

export default function FadeModalWrapper({
  children,
  onClose,
  openDelay = 20,
  durationOpen = 150,
  durationClose = 350,
  easingOpen = "ease",
  easingClose = "ease",
  closeOnBackdrop = false,
  closeOnEsc = true,
  enterSubmits = true,
  labelledBy,
  describedBy,
  role = "dialog",
  asChild = false,
}: FadeModalWrapperProps) {
  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const openTimerRef = useRef<number | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);

  // フェードイン開始
  useEffect(() => {
    openTimerRef.current = window.setTimeout(() => setVisible(true), openDelay);
    return () => {
      if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, [openDelay]);

  // 初期フォーカス & 復帰
  useModalFocus(visible, panelRef);

  // Tab/Shift+Tab をモーダル内にトラップ
  useFocusTrap?.(panelRef, visible);

  // 背面スクロールロック（body補正あり）
  useScrollLock();

  // 背面キー処理用フラグ：body に data-modal-open を付与/解除
  useEffect(() => {
    if (visible) {
      document.body.setAttribute("data-modal-open", "1");
    } else {
      document.body.removeAttribute("data-modal-open");
    }
    return () => document.body.removeAttribute("data-modal-open");
  }, [visible]);

  // 背面を inert 化（フォーカス＆イベントを無効化）
  useEffect(() => {
    const root = document.getElementById("__next");
    if (!root) return;
    (root as any).inert = !!visible;
    return () => {
      (root as any).inert = false;
    };
  }, [visible]);

  // 閉じ要求（見た目の durationClose と同期）
  const requestClose = useMemo(
    () => () => {
      if (closingRef.current) return;
      closingRef.current = true;
      setVisible(false);
      closeTimerRef.current = window.setTimeout(() => {
        onClose();
      }, durationClose);
    },
    [onClose, durationClose]
  );

  // Escで閉じる（ドキュメントレベル）
  useEffect(() => {
    if (!closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (closingRef.current) return;
        requestClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeOnEsc, requestClose]);

  // Enter で“決定”押下（ドキュメントレベル）
  useEffect(() => {
    if (!enterSubmits) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;

      const active = document.activeElement as HTMLElement | null;
      if (active?.tagName === "TEXTAREA") return;
      if (active?.hasAttribute("data-enter-ignore")) return;

      const root = panelRef.current;
      if (!root) return;

      const target =
        root.querySelector<HTMLElement>("[data-enter]:not([disabled])") ||
        root.querySelector<HTMLElement>("[data-autofocus]:not([disabled])") ||
        root.querySelector<HTMLElement>(
          'button[type="submit"]:not([disabled])'
        ) ||
        root.querySelector<HTMLElement>("button:not([disabled])");

      if (target) {
        e.preventDefault();
        (target as HTMLButtonElement).click();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enterSubmits]);

  const transitionStyle: React.CSSProperties = {
    transitionDuration: `${visible ? durationOpen : durationClose}ms`,
    transitionTimingFunction: visible ? easingOpen : easingClose,
  };

  // ARIA 自動配線（title/desc を子から拾って panel に紐づけ）
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (!labelledBy && !panel.hasAttribute("aria-labelledby")) {
      const titleEl = panel.querySelector<HTMLElement>("[data-modal-title]");
      if (titleEl?.id) panel.setAttribute("aria-labelledby", titleEl.id);
    }
    if (!describedBy && !panel.hasAttribute("aria-describedby")) {
      const descEl = panel.querySelector<HTMLElement>("[data-modal-desc]");
      if (descEl?.id) panel.setAttribute("aria-describedby", descEl.id);
    }
  }, [visible, labelledBy, describedBy]);

  // ─────────────────────────────
  //  ① ドキュメント救出：パネル“外”での ↑/↓/←/→ を強制引き込み
  // ─────────────────────────────
  useEffect(() => {
    if (!visible) return;

    const onDocKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (
        key !== "ArrowUp" &&
        key !== "ArrowDown" &&
        key !== "ArrowLeft" &&
        key !== "ArrowRight"
      )
        return;

      const root = panelRef.current;
      if (!root) return;

      // すでにパネル内ならここでは何もしない
      if (root.contains(e.target as Node)) return;

      e.preventDefault();

      if (key === "ArrowLeft" || key === "ArrowRight") {
        const targetSel =
          key === "ArrowLeft"
            ? '[data-action="cancel"]'
            : '[data-action="primary"]';
        const explicit = root.querySelector<HTMLElement>(
          `${targetSel}:not([disabled])`
        );
        if (explicit) {
          explicit.focus();
          return;
        }
        const buttons = Array.from(
          root.querySelectorAll<HTMLButtonElement>("button:not([disabled])")
        ).filter(isUsable);
        if (buttons.length) {
          (key === "ArrowLeft"
            ? buttons[0]
            : buttons[buttons.length - 1]
          ).focus();
        }
        return;
      }

      const fields = Array.from(
        root.querySelectorAll<HTMLElement>(FIELDS_SELECTOR)
      ).filter(isUsable);
      if (fields.length) {
        const target =
          key === "ArrowUp" ? fields[0] : fields[fields.length - 1];
        target.focus();
        setCaretToEnd(target);
      }
    };

    // capture で拾う（body フォーカス時でも確実に届く）
    document.addEventListener("keydown", onDocKeyDown, true);
    return () => document.removeEventListener("keydown", onDocKeyDown, true);
  }, [visible]);

  // ─────────────────────────────
  //  ② パネル内救出：パネル本体（ボディ）に居る時の ↑/↓/←/→ を引き込み
  // ─────────────────────────────
  const onPanelArrowRescue = (e: any) => {
    const key = e.key as string;
    if (
      key !== "ArrowUp" &&
      key !== "ArrowDown" &&
      key !== "ArrowLeft" &&
      key !== "ArrowRight"
    )
      return;

    const root = panelRef.current;
    if (!root) return;

    const target = e.target as HTMLElement | null;

    // 「入力 or ボタン」にいるなら各子のハンドラに任せる
    const inField =
      !!target &&
      root.contains(target) &&
      (target.matches(FIELDS_SELECTOR) || !!target.closest(FIELDS_SELECTOR));
    const inButton =
      !!target &&
      root.contains(target) &&
      (target.tagName === "BUTTON" || !!target.closest("button"));

    if (inField || inButton) return;

    // パネルの“ボディ”など → 強制引き込み
    e.preventDefault();

    if (key === "ArrowLeft" || key === "ArrowRight") {
      const targetSel =
        key === "ArrowLeft"
          ? '[data-action="cancel"]'
          : '[data-action="primary"]';
      const explicit = root.querySelector<HTMLElement>(
        `${targetSel}:not([disabled])`
      );
      if (explicit) {
        explicit.focus();
        return;
      }
      const buttons = Array.from(
        root.querySelectorAll<HTMLButtonElement>("button:not([disabled])")
      ).filter(isUsable);
      if (buttons.length) {
        (key === "ArrowLeft"
          ? buttons[0]
          : buttons[buttons.length - 1]
        ).focus();
      }
      return;
    }

    const fields = Array.from(
      root.querySelectorAll<HTMLElement>(FIELDS_SELECTOR)
    ).filter(isUsable);
    if (fields.length) {
      const focusTo = key === "ArrowUp" ? fields[0] : fields[fields.length - 1];
      focusTo.focus();
      setCaretToEnd(focusTo);
    }
  };

  // asChild のとき、子をそのまま“パネル本体”にする
  const renderPanel = () => {
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<any>;
      const composedRef = composeRefs(child.props.ref, panelRef);

      const mergedClassName = [
        child.props.className,
        "transform transition-all",
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-2 scale-[0.98]",
      ]
        .filter(Boolean)
        .join(" ");

      const injectedProps: any = {
        ref: composedRef,
        tabIndex: child.props.tabIndex ?? -1,
        role: child.props.role ?? role,
        "aria-modal": child.props["aria-modal"] ?? true,
        "aria-labelledby": child.props["aria-labelledby"] ?? labelledBy,
        "aria-describedby": child.props["aria-describedby"] ?? describedBy,
        className: mergedClassName,
        style: { ...(child.props.style || {}), ...transitionStyle },
        onClick: (e: any) => {
          child.props.onClick?.(e);
          e.stopPropagation(); // 中身クリックは backdrop にバブリングさせない
        },
        onKeyDown: (e: any) => {
          // 先に子へ（preventDefault を尊重）
          child.props.onKeyDown?.(e);
          if (!e.defaultPrevented) onPanelArrowRescue(e); // パネル内ボディの救出
        },
      };

      return cloneElement(child, injectedProps);
    }

    // 従来どおり：自前のパネル <div> を描画
    return (
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`
          bg-transparent shadow-none
          rounded-lg sm:rounded-xl
          w-full max-w-[92vw] mx-auto px-4
          sm:w-auto sm:min-w-[20rem] sm:max-w-none
          max-h-[80vh] overflow-y-auto
          sm:max-h-none sm:overflow-visible
          transform transition-all
          ${
            visible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-2 scale-[0.98]"
          }
        `}
        style={transitionStyle}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onPanelArrowRescue}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
      >
        {children}
      </div>
    );
  };

  const modalNode = (
    <FadeModalContext.Provider value={{ close: requestClose }}>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity
          ${visible ? "opacity-100" : "opacity-0"} bg-black/50`}
        style={{
          ...transitionStyle,
          padding:
            "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)",
        }}
        onClick={closeOnBackdrop ? requestClose : undefined}
      >
        {renderPanel()}
      </div>
    </FadeModalContext.Provider>
  );

  if (typeof document === "undefined") return modalNode;
  return createPortal(modalNode, document.body);
}
