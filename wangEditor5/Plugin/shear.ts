import { IButtonMenu, IDomEditor, Boot } from "@wangeditor/editor";

interface ClipboardItem {
	type: string;
	children: {
		text?: string;
		type?: string;
		src?: string;
		style: { width?: string; height?: string };
	}[];
}
class ShearMenu implements IButtonMenu {
	title: string;
	tag: string;
	iconSvg: string;
	constructor() {
		this.title = "剪切"; // 自定义菜单标题
		this.iconSvg = `<svg t="1697016223281" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4017" width="200" height="200"><path d="M766.72 142.784l-253.184 327.04-266.56-340.48s-82.88 103.04-4.48 212.8c78.4 109.824 271.04 331.52 271.04 331.52L793.6 317.632s44.8-82.944-26.88-174.72zM511.424 605.44a39.232 39.232 0 1 1 0-78.464 39.232 39.232 0 0 1 0 78.464z m165.12 8.064a130.496 130.496 0 1 0 0 260.992 130.496 130.496 0 0 0 0-260.992z m0 196.16a65.664 65.664 0 1 1 0-131.392 65.664 65.664 0 0 1 0 131.392zM349.44 613.504a130.496 130.496 0 1 0 0 260.992 130.496 130.496 0 0 0 0-260.992z m0 196.16a65.664 65.664 0 1 1 0-131.392 65.664 65.664 0 0 1 0 131.392z" fill="#4B5563" p-id="4018"></path></svg>`; // 可选
		this.tag = "button";
	}

	// 获取菜单执行时的 value ，用不到则返回空 字符串或 false
	getValue(_editor: IDomEditor): string | boolean {
		let selectTextList: ClipboardItem[] =
			_editor.getFragment() as ClipboardItem[];
		_editor.deleteFragment();

		let clipboardItems = ``;
		for (let selectText of selectTextList) {
			for (let children of selectText.children) {
				console.log(children);
				if (typeof children.text !== "undefined") {
					clipboardItems += `${children.text} \n`;
				} else {
					clipboardItems += `<img src="${children.src}" style="width:${children.style?.width};height:${children.style?.height};"/>`;
				}
			}
		}
		window.navigator.clipboard.writeText(clipboardItems);
		return _editor.getSelectionText();
	}

	// 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
	isActive(editor: IDomEditor): boolean {
		// TS 语法
		return false;
	}

	// 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
	isDisabled(editor: IDomEditor): boolean {
		// TS 语法
		return false;
	}

	// 点击菜单时触发的函数
	async exec(editor: IDomEditor, value: string | boolean) {
		// TS 语法
		if (this.isDisabled(editor)) return;
	}
}

const shearMenuConf = {
	key: "shearMenu",
	factory() {
		return new ShearMenu();
	},
};
Boot.registerMenu(shearMenuConf);
