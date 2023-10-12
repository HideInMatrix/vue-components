import { IButtonMenu, IDomEditor, Boot } from "@wangeditor/editor";
class CopyMenu implements IButtonMenu {
	title: string;
	tag: string;
	iconSvg: string;
	constructor() {
		this.title = "粘贴"; // 自定义菜单标题
		this.iconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 2C4 0.89543 4.89543 0 6 0H14C15.1046 0 16 0.895431 16 2V10C16 11.1046 15.1046 12 14 12H6C4.89543 12 4 11.1046 4 10V2ZM6 1C5.44772 1 5 1.44772 5 2V10C5 10.5523 5.44772 11 6 11H14C14.5523 11 15 10.5523 15 10V2C15 1.44772 14.5523 1 14 1H6ZM2 5C1.44772 5 1 5.44772 1 6V14C1 14.5523 1.44772 15 2 15H10C10.5523 15 11 14.5523 11 14V13H12V14C12 15.1046 11.1046 16 10 16H2C0.89543 16 0 15.1046 0 14V6C0 4.89543 0.89543 4 2 4H3V5H2Z" fill="black"/></svg>`; // 可选
		this.tag = "button";
	}

	// 获取菜单执行时的 value ，用不到则返回空 字符串或 false
	getValue(_editor: IDomEditor): string | boolean {
		return _editor.getHtml();
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
		let clipboardItems = await window.navigator.clipboard.read();
		for (const clipboardItem of clipboardItems) {
			for (const type of clipboardItem.types) {
				const blob = await clipboardItem.getType(type);
				if (type == "text/plain") {
					let text = await blob.text();
					editor.dangerouslyInsertHtml(text);
				} else if (type == "image/png") {
					let url = URL.createObjectURL(blob);
					if (typeof url === "undefined") {
						return;
					}
					let img = new Image();
					img.src = url;
					img.onload = () => {
						let reader = new FileReader();
						reader.readAsDataURL(blob);
						reader.onload = function () {
							//转变成base64，上传到服务器
							let text = `<img src="${reader.result}" style="width:${img.width};height:${img.height};"/>`;
							editor.dangerouslyInsertHtml(text);
						};
					};
				}
			}
		}

		// value 即 this.value(editor) 的返回值
	}
}

const copyMenuConf = {
	key: "copyMenu",
	factory() {
		return new CopyMenu();
	},
};
Boot.registerMenu(copyMenuConf);
