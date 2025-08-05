from pathlib import Path

TARGET_DIRS = {"components", "lib", "pages", "types", "utils"}  # 1階層目のみ追跡


def print_directory_tree(root: Path, indent="", is_root=True):
    # ルート直下の場合のみディレクトリ名でフィルタ
    if not is_root and root.parent == start_path and root.name not in TARGET_DIRS:
        return

    items = sorted(root.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
    for i, item in enumerate(items):
        is_last = i == len(items) - 1
        branch = "└── " if is_last else "├── "
        print(indent + branch + item.name)
        if item.is_dir():
            extension = "    " if is_last else "│   "
            print_directory_tree(item, indent + extension, is_root=False)


if __name__ == "__main__":
    start_path = Path(r"C:\Users\katsu\Desktop\orgnest")  # ← プロジェクトルート
    print(start_path.name)  # 出力の親をディレクトリ名に固定
    print_directory_tree(start_path)
