/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import * as VendorPrefix from "react-vendor-prefix";
import StandardLib from "../Utils/StandardLib";
import Resizer from "./Resizer";
import ResizerOverlay from "./ResizerOverlay";

const RESIZEROVERLAY:string = "resizer";
const HORIZONTAL:string = "horizontal";

interface LayoutState {
    id?: string[];
    children?: LayoutState[];
    direction?: string;
    flex?: number
}

interface LayoutProps {
    state: LayoutState;
    onStateChange: Function;
    pane1?: string;
    pane2?:string;
    key: number;
    ref: string;
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

    private boundHandleStateChange: Function;

    private element: Element;

    private childNames:string[];
    private resizerNames:string[];

    constructor(props: LayoutProps, state: LayoutState) {
        super(props, state);

        this.state = props.state;
        this.minSize = 16;
        this.boundHandleStateChange = this.handleStateChange.bind(this);
        this.dragging = false;
    }

    componentDidMount(): void {
      document.addEventListener("mouseup", this.boundMouseUp = this.onMouseUp.bind(this));
      document.addEventListener("mousedown", this.boundMouseDown = this.onMouseDown.bind(this));

      this.element.addEventListener("mousemove", this.boundMouseMove = this.onMouseMove.bind(this));
    }

    componentWillReceiveProps(nextProps: LayoutProps): void {
      this.setState(StandardLib.includeMissingPropertyPlaceholders(this.state, nextProps.state));
    }

    compoenentWillUnmount(): void {
      document.removeEventListener("mousedown", this.boundMouseDown);
      document.removeEventListener("mouseup", this.boundMouseUp);
      this.element.removeEventListener("mouseMove", this.boundMouseMove);
    }

    shouldComponentUpdate(nextProps:LayoutProps, nextState:LayoutState): boolean {
      return !_.isEqual(this.state, nextState) || !_.isEqual(this.state, nextProps.state);
    }

    componentDidUpdate():void {
      if(this.props.onStateChange) {
        this.props.onStateChange();
      }
    }

    private getComponentFromId (id: number): Layout {
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

    private getDOMNodeFromId (id: number): Element {
        var component = this.getComponentFromId(id);
        if(component) {
          return component.element;
        }
    }

    private onMouseDown (event: MouseEvent): void {
      this.resizerNames.forEach((resizerName:string) => {
          var resizer: Resizer = this.refs[resizerName] as Resizer;
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

                var pane1: Layout = this.refs[resizer.props.pane1] as Layout;
                var pane2: Layout = this.refs[resizer.props.pane2] as Layout;

                pane1.setState({
                   flex: (mousePos - begin) / size
                });

                pane2.setState({
                    flex: (end - mousePos) / size
                });

                resizer.setState({
                    active: false
                });

                resizerOverlay.setState({
                    active: false
                });

                this.handleStateChange();
            }
        });
        this.panelDragging = false;
    }

    handleStateChange(): void {
      this.setState({
          children: this.childNames.filter((ref:string) => {
              return this.refs[ref] ? true : false;
          }).map((ref:string) => {
            return (this.refs[ref] as Layout).state;
          })
      });
    }

    render() {
        this.childNames = [];
        this.resizerNames = [];
        var style:any = {
            display: "flex",
            flex: this.state.flex,
            width: "100%",
            height: "100%",
            position: "relative",
            outline: "none",
            overflow: "hidden",
            userSelect: "none",
            flexDirection: this.state.direction === HORIZONTAL ? "row" : "column"
        };

        if (this.state.children && this.state.children.length > 0) {
           var newChildren:JSX.Element[] = new Array(this.state.children.length * 2 - 1);

           this.state.children.forEach((childState:LayoutState, i:number) => {
              var ref:string = "child" + i;
              this.childNames[i] = ref;
              newChildren[i * 2] = <Layout onStateChange={this.boundHandleStateChange} ref={ref} state={childState} key={i * 2}/>;
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
                <ResizerOverlay ref={RESIZEROVERLAY} direction={this.state.direction}/>
            </div>
        );
    }
}
