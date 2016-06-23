import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import Menu, {MenuItemProps} from "./Menu";
import Dropdown from "../semantic-ui/Dropdown";
import classNames from "../modules/classnames";

export interface MenuButtonProps extends React.HTMLProps<MenuButton>
{
	menu:MenuItemProps[];
	showIcon?:boolean;
	onClose?:()=>void;
}

export interface MenuButtonState
{
	
}

export default class MenuButton extends React.Component<MenuButtonProps, MenuButtonState>
{
	element:HTMLElement;
	menu:Menu;
	constructor(props:MenuButtonProps)
	{
		super(props)
	}

	static defaultProps:MenuButtonProps = {
		showIcon: true,
		menu: []
	};

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this) as HTMLElement;
	}

	render():JSX.Element
	{
		var props = _.clone(this.props);
		delete props.menu;
		delete props.showIcon;

		var dropdownClass = classNames({
			"button": true,
			"icon": !!this.props.showIcon
		});

		return (
			<Dropdown
				className={dropdownClass}
				menuGetter={() => this.props.menu}
				{...props as any}
			>
				<div style={{display:"flex", justifyContent:"center"}}>
					{ this.props.showIcon ? <i className="fa fa-bars fa-fw"/> : '' }
					{ this.props.showIcon ? ' ':''}
					{ this.props.children }
				</div>
			</Dropdown>
		);
	}
}
