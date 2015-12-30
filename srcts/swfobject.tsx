/// <reference path="../typings/react/react.d.ts"/>
/// <reference path="../typings/react/react-dom.d.ts"/>
/// <reference path="../typings/swfobject/swfobject.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as swfobject from "swfobject-amd";

interface ISwfObjectProps extends React.Props<Swfobject> {
    swfUrl:string;
    xiSwfUrlStr?:string;
    swfVersionStr?:string;
    flashvars?:Object;
    params?: {
        quality?:string;
        bgcolor?:string;
        allowscriptaccess?:string;
        allowfullscreen?:string;
        base?:string;
    },
    attributes: {
        id:string;
        name?:string;
        align?:string;
    },
    style?:any,
    onLoad?: (callbackObj: swfobject.ICallbackObj) => void
}

export default class Swfobject extends React.Component<ISwfObjectProps, any> {

    static defaultProps:ISwfObjectProps = {
        swfUrl: "",
        xiSwfUrlStr: "playerProductInstall.swf",
        swfVersionStr: "10.2.0",
        params: {
            quality: "high",
            bgcolor: "#ffffff",
            allowscriptaccess: "sameDomain",
            allowfullscreen: "true",
            base: window.location.protocol + "//" + window.location.host
        },
        flashvars: {

        },
        attributes: {
            id: "flash",
            name: "flash",
            align: "middle"
        }
    }

    constructor(props:ISwfObjectProps) {
        super(props);
    }

    componentDidMount() {

        swfobject.embedSWF(
            this.props.swfUrl, ReactDOM.findDOMNode(this.refs["swfobject"]),
            "100%", "100%",
            this.props.swfVersionStr, this.props.xiSwfUrlStr,
            this.props.flashvars, this.props.params, this.props.attributes, this.props.onLoad);
    }

    render() {
        return (
            <div style={this.props.style}>
                <div ref="swfobject">
                    <p>
                        To view this page ensure that Adobe Flash Player version
                        10.2.0 or greater is installed.
                    </p>
                    <a href='http://www.adobe.com/go/getflashplayer'><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player" />
                    </a>
                </div>
            </div>
        );
    }
}
