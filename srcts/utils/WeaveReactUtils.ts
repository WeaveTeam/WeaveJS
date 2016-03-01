import * as React from "react";
import * as lodash from "lodash";

import LinkableVariable = weavejs.core.LinkableVariable;

export function linkReactState(linkableVariable: LinkableVariable, reactObject: React.Component<any, any>, statePath: Array<string>, delay?: number) {
	delay = delay !== undefined ? delay : 500;

	let updateState = function(nextState: any) {
		if (statePath && statePath.length) {
			let leafKey: string = statePath[statePath.length - 1];
			let obj: any = nextState;
			for (let idx = 0; idx < statePath.length - 1; idx++) {
				obj = obj[statePath[idx]];
			}
			linkableVariable.state = obj[leafKey];
		}
		else {
			linkableVariable.state = nextState;
		}
	};

	let updateStateDebounced = lodash.debounce(updateState, delay, { leading: false });

	let oldShouldComponentUpdate = (reactObject as any).shouldComponentUpdate;
	(reactObject as any).shouldComponentUpdate =
		function(nextProps: any, nextState: any) {
			updateStateDebounced(nextState);

			if (oldShouldComponentUpdate) {
				return oldShouldComponentUpdate.call(this, nextProps, nextState);
			}
			else {
				return true;
			}
		};

	linkableVariable.addGroupedCallback(null,
		function() {
			if (statePath && statePath.length) {
				let obj: any = {};
				let leafKey: string = statePath[statePath.length - 1];
				for (let idx = 0; idx < statePath.length - 1; idx++) {
					obj[statePath[idx]] = {};
					obj = obj[statePath[idx]];
				}
				obj[leafKey] = linkableVariable.state;
				reactObject.setState(obj);
			}
			else {
				reactObject.setState(linkableVariable.state);
			}
		}
		, true);

	return;
}