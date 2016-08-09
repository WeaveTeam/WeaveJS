/// <reference path="weavejs-core.d.ts" />
/// <reference path="weavejs.d.ts" />

declare module weavejs {
	class Weave extends __global__.Weave {

	}
}

declare module "weavejs" {
	export = weavejs;
}