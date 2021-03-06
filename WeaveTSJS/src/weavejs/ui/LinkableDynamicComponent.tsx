namespace weavejs.ui
{
	import ILinkableVariable = weavejs.api.core.ILinkableVariable;
	import LinkableVariable = weavejs.core.LinkableVariable;

	export class LinkableDynamicComponent extends React.Component<any, any> implements ILinkableVariable
	{
		static WEAVE_INFO = Weave.setClassInfo(LinkableDynamicComponent, {
			id: 'weavejs.ui.LinkableDynamicComponent',
			interfaces: [ILinkableVariable]
		});

		private linkableState = Weave.linkableChild(this, LinkableVariable, this.forceUpdate, true);
		
		getSessionState():any
		{
			return this.linkableState.state;
		}
		
		setSessionState(value:any)
		{
			this.linkableState.state = value;
		}
		
		render()
		{
			return this.renderFromState(this.linkableState.state);
		}
		
		private refHandler=(instance:React.ReactInstance)=>
		{
			if (instance instanceof React.Component)
				Weave.disposableChild(this, instance);
		}
		
		private renderFromState(state:any):JSX.Element
		{
			if (typeof state != 'object')
				return state as any;
			
			var ComponentClass = state ? Weave.getDefinition(state.class) : null;
			if (!ComponentClass)
				return null;
			
			var props = _.omit(state, 'class') as any;
			
			if (!Array.isArray(props.children))
				props.children = [props.children];
			
			props.children = (props.children as any[]).map(this.renderFromState, this);
			
			if (Array.isArray(props.children) && (props.children as any[]).length == 1)
				props.children = (props.children as any[])[0];
			
			return <ComponentClass ref={this.refHandler} {...props}/>;
		}
	}
}
