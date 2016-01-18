/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import * as VendorPrefix from "react-vendor-prefix";
import StandardLib from "../utils/StandardLib";
import Resizer from "./Resizer";
import ResizerOverlay from "./ResizerOverlay";

const RESIZEROVERLAY:string = "resizer";
const HORIZONTAL:string = "horizontal";

export interface LayoutState {
    id?: string[];
    children?: LayoutState[];
    direction?: string;
    flex?: number
}

export interface LayoutProps extends React.Props<Layout> {
    state: LayoutState;
    onStateChange: Function;
    pane1?: string;
    pane2?:string;
    weave?: any
}

export default class Layout extends React.Component<LayoutProps, LayoutState> {

    public state:LayoutState;

    private minSize: number;
    private dragging: boolean;

    private boundMouseUp: any;
    private boundMouseDown: any;
    private boundMouseMove: any;

    private panelDragging: boolean = false;

    private element: Element;

    private childNames:string[];
    private resizerNames:string[];

    constructor(props: LayoutProps, state: LayoutState) {
        super(props, state);
        var ps = props.state || {};
        this.state = {id: ps.id, direction: ps.direction, children: ps.children, flex: ps.flex};
        this.minSize = 16;
        this.dragging = false;
    }

    componentDidMount(): void {
      document.addEventListener("mouseup", this.boundMouseUp = this.onMouseUp.bind(this));
      document.addEventListener("mousedown", this.boundMouseDown = this.onMouseDown.bind(this));
      document.addEventListener("mousemove", this.boundMouseMove = this.onMouseMove.bind(this));
    }

    componentWillReceiveProps(nextProps: LayoutProps): void {
      this.setState(StandardLib.includeMissingPropertyPlaceholders(this.state, nextProps.state));
    }

    compoenentWillUnmount(): void {
      document.removeEventListener("mousedown", this.boundMouseDown);
      document.removeEventListener("mouseup", this.boundMouseUp);
      document.removeEventListener("mouseMove", this.boundMouseMove);
    }

    shouldComponentUpdate(nextProps:LayoutProps, nextState:LayoutState): boolean {
      return !_.isEqual(this.state, nextState) || !_.isEqual(this.state, nextProps.state);
    }

    componentDidUpdate():void {
      if(this.props.onStateChange && this.state) {
        this.props.onStateChange(this.state);
      }
    }

    public getDOMNodeFromId (id:string[]): Element {
        var component = this.getComponentFromId(id);
        if(component) {
          return component.element;
        }
    }

    private getComponentFromId (id:string[]): Layout {
      if(this.state.id && _.isEqual(this.state.id, id)) {
        return this;
      } else {
        for(var i:number = 0; i < this.childNames.length; i++) {
          var component: Layout = (this.refs[this.childNames[i]] as Layout).getComponentFromId(id);
          if(component) {
            return component;
          }
        }
      }
    }



    private onMouseDown (event: MouseEvent): void {
      this.resizerNames.forEach((resizerName:string) => {
          var resizer:Resizer = this.refs[resizerName] as Resizer;
          if(resizer && resizer.state && resizer.state.active) {
            var overlayRange:number[] = this.getResizerRange(resizer);
            overlayRange[0] += this.minSize;
            overlayRange[1] -= this.minSize;
            (this.refs[RESIZEROVERLAY] as ResizerOverlay).setState({
              active: true,
              range: overlayRange
            });
          }
        })
    }

    onMouseMove(event:MouseEvent):void {

    }

    getResizerRange(resizer:Resizer): number[] {
      var direction:string = resizer.props.direction;
      var pane1:Layout = this.refs[resizer.props.pane1] as Layout;
      var pane2:Layout = this.refs[resizer.props.pane2] as Layout;

      var element1:HTMLElement = ReactDOM.findDOMNode(pane1) as HTMLElement;
      var element2:HTMLElement = ReactDOM.findDOMNode(pane2) as HTMLElement;

      var rect:ClientRect = this.element.getBoundingClientRect();
      var pageLeft:number = window.pageXOffset + rect.left;
      var pageTop:number = window.pageYOffset + rect.top;

      if(direction === HORIZONTAL) {
        return [element1.offsetLeft + pageLeft, element2.offsetLeft + element2.clientWidth + pageLeft];
        } else {
            return [element1.offsetTop + pageTop, element2.offsetTop + element2.clientHeight + pageTop];
        }
    }

    onMouseUp (event:MouseEvent) {
        var newState:LayoutState = _.cloneDeep(this.state);

        this.resizerNames.forEach(resizerName => {
            var resizer:Resizer = this.refs[resizerName] as Resizer;
            var resizerOverlay:ResizerOverlay = this.refs[RESIZEROVERLAY] as ResizerOverlay;

            if (resizer && resizer.state && resizer.state.active) {
                var range:number[] = this.getResizerRange(resizer);
                var begin:number = range[0];
                var end:number = range[1];
                var mousePos:number = this.state.direction === HORIZONTAL ? event.pageX : event.pageY;
                var size:number = this.state.direction === HORIZONTAL ? this.element.clientWidth : this.element.clientHeight;

                mousePos = Math.max(begin + this.minSize, Math.min(mousePos, end - this.minSize));

                var ref1:string = resizer.props.pane1;
                var ref2:string = resizer.props.pane2;

                var pane1: Layout = this.refs[ref1] as Layout;
                var pane2: Layout = this.refs[ref2] as Layout;


                var index1:number = this.childNames.indexOf(ref1);
                var index2:number = this.childNames.indexOf(ref2);

                var flex1:number = (mousePos - begin) / size;
                var flex2: number = (end - mousePos) / size;

                newState.children[index1].flex = flex1;
                newState.children[index2].flex = flex2;

                pane1.setState({
                   flex: flex1
                });

                pane2.setState({
                    flex: flex2
                });

                resizer.setState({
                    active: false
                });

                resizerOverlay.setState({
                    active: false
                });
                this.setState(newState);
            }
        });
        this.panelDragging = false;
    }

    handleStateChange(childRef:string, newState:LayoutState): void {
        var stateCopy:LayoutState = _.cloneDeep(this.state);
        var index = this.childNames.indexOf(childRef);

        stateCopy.children[index] = newState;
        this.setState(stateCopy);
    }

    render() {
        this.childNames = [];
        this.resizerNames = [];
        var style:any = {
            display: "flex",
            flex: this.state.flex,
            position: "relative",
            outline: "none",
            overflow: "hidden",
            userSelect: "none",
            flexDirection: this.state.direction === HORIZONTAL ? "row" : "column"
        };

        if(this.state.direction === HORIZONTAL) {
          style.height = "100%";
        } else {
          style.width = "100%";
        }

        if (this.state.children && this.state.children.length > 0) {
           var newChildren:JSX.Element[] = new Array(this.state.children.length * 2 - 1);

           this.state.children.forEach((childState:LayoutState, i:number) => {
              var ref:string = "child" + i;
              this.childNames[i] = ref;
              newChildren[i * 2] = <Layout onStateChange={this.handleStateChange.bind(this, ref)} ref={ref} state={childState} key={i * 2}/>;
           });

           var i:number;
           for(i = 1; i < newChildren.length - 1; i += 2) {
             var resizerName:string = "resizer" + (i / 2);
             this.resizerNames.push(resizerName);
             var resizer:JSX.Element = <Resizer ref={resizerName} key={i} direction={this.state.direction} pane1={newChildren[i - 1].ref as string} pane2={newChildren[i + 1].ref as string}/>;
             newChildren[i] = resizer;
           }
        }

        var prefixed:any = VendorPrefix.prefix({styles: style});

        return (
            <div ref={(elt:Element) => { this.element = elt; }} style={prefixed.styles}>
                {newChildren}
                <ResizerOverlay ref={RESIZEROVERLAY} key={RESIZEROVERLAY} direction={this.state.direction}/>
            </div>
        );
    }
}
