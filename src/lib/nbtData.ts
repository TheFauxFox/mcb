export type NBTData = {
	italic?: boolean | number;
	underlined?: boolean | number;
	bold?: boolean | number;
	obfuscated?: boolean | number;
	strikethrough?: boolean | number;
	color?: string;
	text?: string;
	extra?: NBTData[];
	with?: Array<NBTData | string>;
	translate?: string;
	insertion?: string;
	clickEvent?: { action?: string; value?: string };
	hoverEvent?: {
		action?: string;
		value?: string;
		contents?: NBTData & { type?: string; id?: string; name?: string };
	};
	''?: string;
};
