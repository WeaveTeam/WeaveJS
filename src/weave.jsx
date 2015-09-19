import React from "react";
import swfobject from "swfobject-amd";

export default class Weave extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        var swfVersionStr = "10.2.0";
        // To use express install, set to playerProductInstall.swf, otherwise the empty string.
        var xiSwfUrlStr = "playerProductInstall.swf";
        var flashvars = {};
        var params = {};
        params.quality = "high";
        params.bgcolor = "#ffffff";
        params.allowscriptaccess = "sameDomain";
        params.allowfullscreen = "true";
        params.base = window.location.protocol + "//" + window.location.host;
        var attributes = {};
        attributes.id = "weave";
        attributes.name = "weave";
        attributes.align = "middle";
        swfobject.embedSWF(
            "../weave.swf", React.findDOMNode(this),
            "100%", "100%",
            swfVersionStr, xiSwfUrlStr,
            flashvars, params, attributes);
        // JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
        swfobject.createCSS("#flashContent", "display:block;text-align:left;z-index=2");
    }

    render () {
        return (
            <div>
                <p>
                    To view this page ensure that Adobe Flash Player version
                    10.2.0 or greater is installed.
                </p>
                <a href='http://www.adobe.com/go/getflashplayer'><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player" />
                </a>
            </div>
        );
    }

}
