import * as React from "react";
import * as lodash from "lodash";
import update from "react-addons-update";

import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import IDisposableObject = weavejs.api.core.IDisposableObject;

let WEAVEUPDATECONFIG = "weaveUpdateConfig";

export class WeaveReactSynchronizer
{	
	private statePath: Array<string>;
	private linkableVariable: LinkableVariable;
	private context: ILinkableObject;
	private reactObject: React.Component<any, any>;

	constructor(context:ILinkableObject, linkableVariable: LinkableVariable, reactObject: React.Component<any, any>, statePath: Array<string>, delay?: number)
	{
		delay = delay !== undefined ? delay : 500;

		let reactObjectAny = reactObject as any;

		if (!reactObjectAny[WEAVEUPDATECONFIG])
		{
			reactObjectAny.oldShouldComponentUpdate = (reactObject as any).shouldComponentUpdate;
			reactObjectAny[WEAVEUPDATECONFIG] = {};
			reactObjectAny.shouldComponentUpdate =
				function(nextProps: any, nextState: any) {
					let pathStack = new Array<Array<string>>();
					pathStack.push([]);

					let config:any = reactObjectAny[WEAVEUPDATECONFIG];

					while (pathStack.length)
					{
						let path = pathStack.pop();
						let item = lodash.get(config, path) || config;

						if (item instanceof Function)
						{
							item(nextState);
						}
						else if (lodash.isPlainObject(item))
						{
							for (let pathElement of Object.keys(item))
							{
								pathStack.push(path.concat([pathElement]));
							}
						}
					}
					if (this.oldShouldComponentUpdate)
						return this.oldShouldComponentUpdate(nextProps, nextState);
					return true;
				};
		}

		this.debouncedReactToWeave = lodash.debounce(this.reactToWeave, delay, { leading: false });

		if (statePath == null)
		{
			reactObjectAny[WEAVEUPDATECONFIG] = this.debouncedReactToWeave;
		}
		else
		{
			lodash.set(reactObjectAny[WEAVEUPDATECONFIG], statePath, this.debouncedReactToWeave);
		}

		this.linkableVariable = linkableVariable;
		this.statePath = statePath;
		this.context = context;
		this.reactObject = reactObject;
		this.linkableVariable.addGroupedCallback(this, this.weaveToReact);
	}

	debouncedReactToWeave: Function;

	reactToWeave=(nextState:any):void=>
	{
		this.linkableVariable.state = lodash.get(nextState, this.statePath);
	}

	weaveToReact=():void=>
	{
		var mergeObj = {};
		
		lodash.set(mergeObj, this.statePath, this.linkableVariable.state);

		var newObj = update(this.reactObject.state, { $merge: mergeObj });

		this.reactObject.setState(newObj);
	}

	dispose():void
	{
		if (lodash.get((this.reactObject as any)[WEAVEUPDATECONFIG] , this.statePath) === this.debouncedReactToWeave)
			lodash.set((this.reactObject as any)[WEAVEUPDATECONFIG], this.statePath, undefined);

		this.linkableVariable.removeCallback(this.context, this.weaveToReact);
	}
}
