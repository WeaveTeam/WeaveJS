import React from "react";
import ReactDOM from "react-dom";
import swfobject from "swfobject-amd";

class Swfobject extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        swfobject.embedSWF(
            this.props.swfUrl, ReactDOM.findDOMNode(this.refs.swfobject),
            "100%", "100%",
            this.props.swfVersionStr, this.props.xiSwfUrlStr,
            this.props.flashvars, this.props.params, this.props.attributes, this.props.onLoad);
    }

    render () {
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

Swfobject.defaultProps = {
    xiSwfUrlStr: "playerProductInstall.swf",
    swfVersionStr: "10.2.0",
    params: {
        quality: "high",
        bgcolor: "#ffffff",
        allowscriptaccess: "sameDomain",
        allowfullscreen: "true",
        base: window.location.protocol + "//" + window.location.host
    },
    position: {
        position: "relative",
        width: "100%",
        height: "100%"
    },
    flashvars: {

    },
    attributes: {
        id: "flash",
        name: "flash",
        align: "middle"
    }
};

Swfobject.propTypes = {
    swfUrl: React.PropTypes.string.isRequired,
    xiSwfUrlStr: React.PropTypes.string,
    params: React.PropTypes.shape({
        quality: React.PropTypes.string,
        bgcolor: React.PropTypes.string,
        allowscriptaccess: React.PropTypes.string,
        allowfullscreen: React.PropTypes.string,
        base: React.PropTypes.string
    }),
    attributes: React.PropTypes.shape({
        id: React.PropTypes.string.isRequired,
        name: React.PropTypes.string,
        align: React.PropTypes.string
    })
};

export default Swfobject;
