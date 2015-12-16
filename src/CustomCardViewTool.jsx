import React from "react";
import ReactDOM from "react-dom";
import VendorPrefix from "react-vendor-prefix";
import {registerToolImplementation} from "./WeaveTool.jsx";
import _ from "lodash";
import * as bs from "react-bootstrap";
import ui from "./react-ui/ui.jsx";


const OKBUTTON = "ok";
const RMBUTTON = "rm";

class CustomCardViewTool extends React.Component {


    constructor(props) {
        super(props);


        this.setCardsSelection = _.debounce(this.setCardsSelection.bind(this), 100);
        this.setCardsProbe = _.debounce(this.setCardsProbe.bind(this), 50);
        this.resizeCards = this.resizeCards.bind(this);
        this.resizePictures = this.resizePictures.bind(this);
        this.resizeTool = this.resizeTool.bind(this);

        this.dataChanged = _.debounce(this.dataChanged.bind(this), 100);

        var mapping = [
            { name: "header", type: "LinkableHashMap", callback: this.dataChanged },
            { name: "title", type: "LinkableHashMap", callback: this.dataChanged },
            { name: "attributesLeft", type: "LinkableHashMap", callback: this.dataChanged },
            { name: "attributesRight", type: "LinkableHashMap", callback: this.dataChanged },
            { name: "sort", type: "DynamicColumn", callback: this.dataChanged },
            { name: "sortDirection", type: "LinkableString", callback: this.dataChanged },
            { name: "selectionKeySet", type: "KeySet", callback: this.setCardsSelection },
            { name: "probeKeySet", type: "KeySet", callback: this.setCardsProbe },
            { name: "cardWidth", type: "LinkableNumber", callback: this.resizeCards },
            { name: "cardHeight", type: "LinkableNumber", callback: this.resizeCards },
            { name: "pictureHeight", type: "LinkableNumber", callback: this.resizePictures },
            { name: "pictureWidth", type: "LinkableNumber", callback: this.resizePictures },
            { name: "toolHeight", type: "LinkableNumber", callback: this.resizeTool }
        ];

        this.toolPath = this.props.toolPath;
        this.paths = this.toolPath.initProperties(mapping);
        this.formattedRecords = [];
        this.checkedRecords = [];
        this.state = {
            hiddenCardKeys: []
        };
    }

    componentDidMount() {
        React.findDOMNode(this).parentNode.addEventListener("click", this.boundClearSelection = this.clearSelection.bind(this));
    }

    componentWillUnmount() {
         React.findDOMNode(this).parentNode.removeEventListener("click", this.boundClearSelection);
    }

    componentDidUpdate () {
        this.setCardsSelection();
        this.setCardsProbe();
    }

    clearSelection () {
        // this.paths.selectionKeySet.setKeys([]);
    }

    onSelect(index, event) {

        var selectedKeys = [];
        if(!(event.ctrlKey || event.metaKey)) {
            selectedKeys = this.refs[index].state.selected ? [this.refs[index].props.data.id] : [];
        } else {
            for(var key in this.refs) {
                var ref = this.refs[key];
                if(ref.state.selected) {
                    selectedKeys.push(ref.props.data.id);
                }
            }
        }
        this.paths.selectionKeySet.setKeys(selectedKeys);
    }

    onProbe(index) {

        var probedKeys = [];
        probedKeys = this.refs[index].state.probed ? [this.refs[index].props.data.id] : [];
        this.paths.probeKeySet.setKeys(probedKeys);
    }

    setCardsSelection() {
        var selectedKeys = this.paths.selectionKeySet.getKeys();
        for(var key in this.refs) {
            var ref = this.refs[key];
            if(selectedKeys.indexOf(ref.props.data.id) > -1) {
                ref.setState({
                    selected: true
                });
            } else {
                ref.setState({
                    selected: false
                });
            }
        }
    }

    setCardsProbe() {
        var probedKeys = this.paths.probeKeySet.getKeys();
        for(var key in this.refs) {
            var ref = this.refs[key];
            if(probedKeys.indexOf(ref.props.data.id) > -1) {
                ref.setState({
                    probed: true
                });
            } else {
                ref.setState({
                    probed: false
                });
            }
        }
    }

    resizeCards() {

    }

    resizePictures() {

    }

    resizeTool() {

    }

    handleRemoveCard(index, event) {
        // makes copy of state array
        var keys = _.clone(this.state.hiddenCardKeys);
        keys.push(this.refs[index].props.data.id);
        this.setState({
            hiddenCardKeys: _.uniq(keys)
        });

        this.paths.selectionKeySet.removeKeys(keys);

        event.stopPropagation();
    }

    handleSaveCard(index, event) {

        if(this.refs[index].state.selected) {
            this.paths.selectionKeySet.removeKeys([this.refs[index].props.data.id]);
        } else {
            var keys = this.paths.selectionKeySet.getKeys();
            keys.push(this.refs[index].props.data.id);
            this.paths.selectionKeySet.setKeys(
                _.uniq(keys)
            );
        }

        event.stopPropagation();
    }

    dataChanged() {

        var mapping = {
            header: this.paths.header.getNames().map((name) => { return this.paths.header.push(name); }),
            title: this.paths.title.getNames().map((name) => { return this.paths.title.push(name); }),
            attributesLeft: this.paths.attributesLeft.getNames().map((name) => { return this.paths.attributesLeft.push(name); }),
            attributesRight: this.paths.attributesRight.getNames().map((name) => { return this.paths.attributesRight.push(name); }),
            sort: this.paths.sortColumn
        };

        this.setState({
            hiddenCardKeys: []
        });

        var attributeNamesLeft = this.paths.attributesLeft.getNames();

        var attributeNamesRight = this.paths.attributesRight.getNames();

        this.records = _.sortByOrder(this.toolPath.retrieveRecords(mapping), "sort", this.toolPath.getState('sortDirection') || 'desc');

        this.formattedRecords = this.records.map((record) => {
            var formattedRecord = {};
            formattedRecord.id = record.id;
            var header = "";
            if(record.hasOwnProperty("header")) {
                for(var key in record.header) {
                    header += record.header[key] + " ";
                }
            }

            formattedRecord.header = header;

            var title = "";
            if(record.hasOwnProperty("title")) {
                for(key in record.title) {
                    title += record.title[key] + " ";
                }
            }

            formattedRecord.title = title;

            var attributesLeft = [];
            if(record.hasOwnProperty("attributesLeft")) {
                for(var i in attributeNamesLeft) {
                    attributesLeft.push({
                        name: this.paths.attributesLeft.push(attributeNamesLeft[i]).getValue("getMetadata('title')"),
                        value: record.attributesLeft[i]
                    });
                }
            }

            var attributesRight = [];
            if(record.hasOwnProperty("attributesRight")) {
                for(i in attributeNamesRight) {
                    attributesRight.push({
                        name: this.paths.attributesRight.push(attributeNamesRight[i]).getValue("getMetadata('title')"),
                        value: record.attributesRight[i]
                    });
                }
            }

            formattedRecord.attributesLeft = attributesLeft;
            formattedRecord.attributesRight = attributesRight;

            formattedRecord.imgUrl = record.imgUrl;
            return formattedRecord;
        });
        this.forceUpdate();
    }

    render() {
        // this.paths.selectionKeySet.setKeys(this.state.selected);
        // this.paths.probeKeySet.setKeys(this.state.probed);
        var filteredRecords = _.filter(this.formattedRecords, (formattedRecord) => {
            return !_.includes(this.state.hiddenCardKeys, formattedRecord.id);
        });
        var cards = filteredRecords.map((formattedRecord, index) => {
            return <Card data={formattedRecord} key={index} ref={index} onSelect={this.onSelect.bind(this, index)} handleSaveCard={this.handleSaveCard.bind(this, index)} handleRemoveCard={this.handleRemoveCard.bind(this, index)} onProbe={this.onProbe.bind(this, index)}/>;
        });

        return (
            <div style={{width: "100%", height: "100%"}}>
                {
                    cards
                }
            </div>
        );
    }
}

class Card extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            probed: false,
            selected: false,
            rmProbe: false,
            checkProbe: false
        };
    }

    componentDidMount () {
        this.element = React.findDOMNode(this);
        //this.element.addEventListener("click", this.boundToggleSelect = this.toggleSelect.bind(this));
        this.okButton = React.findDOMNode(this.refs[OKBUTTON]);
        this.rmButton = React.findDOMNode(this.refs[RMBUTTON]);

        this.okButton.addEventListener("click", this.boundHandleSaveCard = this.props.handleSaveCard.bind(this));
        this.rmButton.addEventListener("click", this.boundHandleRemoveCard = this.props.handleRemoveCard.bind(this));

    }

    componentWillUnmount() {
        //this.element.removeEventListener("click", this.boundToggleSelect);
        this.okButton.removeEventListener("click", this.boundHandleSaveCard);
        this.rmButton.removeEventListener("click", this.boundHandleRemoveCard);
    }

    toggleSelect (event) {
        this.setState({
            selected: !this.state.selected
        }, () => {
            this.props.onSelect(event);
        });

        event.stopPropagation();
    }

    toggleProbe (event) {
        this.setState({
            probed: !this.state.probed
        }, () => {
            this.props.onProbe(event);
        });
    }

    toggleCheckProbe () {
        this.setState({
            checkProbe: !this.state.checkProbe
        });
    }

    toggleRmProbe () {
        this.setState({
           rmProbe: !this.state.rmProbe
        });
    }

    render() {

        var data = this.props.data;

        var contactIcon = {
            flex: 0.2,
            //backgroundColor: this.state.probed ? "#8b8c8e" : "#e9eaed",
            backgroundAlpha: "0",
            backgroundImage: "url(img/contact-icon.png)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center"
        };

        var cardStyle = {
            height: "150",
            width: "300",
            marginLeft: 5,
            marginRight: 5,
            marginBottom: 10,
            backgroundColor: (() => {
                if(this.state.selected && this.state.rmProbe) {
                    return "#DCC6DC"; // purple
                } else if(this.state.checkProbe) {
                    return "#dae2fc"; // blue
                } else if (this.state.rmProbe) {
                    return "rgba(224, 141, 157, 0.4)"; // red
                } else if (this.state.selected) {
                    return "#dae2fc";
                } else {
                    return "#e9eaed"; // default grey
                }
            })(),
            border: "solid",
            padding: "5px",
            borderWidth: "0px",
            borderColor: "#286090",
            boxShadow: "0 1px 1px rgba(0,0,0,.05)",
            float: "left",
            overflow: "hidden"
        };

        var OKglyphStyle = {
            fontSize: "14px",
            color: "#93a5aa",
            cursor: "default"
        };

        var RMglyphStyle = {
            fontSize: "14px",
            color: "#93a5aa",
            cursor: "default"
        };

        if(this.state.selected) {
            OKglyphStyle.color = "green";
        } else {
            OKglyphStyle.color = "#93a5aa";
        }

        if(this.state.rmProbe) {
            RMglyphStyle.color = "red";
        } else {
            RMglyphStyle.color = "#93a5aa";
        }

        var cardStyleprefixed = VendorPrefix.prefix({styles: cardStyle});

        var rowsLeft = data.attributesLeft.map((attribute, index) => {
            return (
                <tr key={index}>
                  <th>{attribute.name}</th>
                  <td>{attribute.value}</td>
                </tr>
            );
        });

        var rowsRight = data.attributesRight.map((attribute, index) => {
            return (
                <tr key={index}>
                  <th>{attribute.name}</th>
                  <td>{attribute.value}</td>
                </tr>
            );
        });

        return (
            <div style={cardStyleprefixed.styles} onMouseOver={this.toggleProbe.bind(this)} onMouseOut={this.toggleProbe.bind(this)}>
                <div style={{float: "right"}}>
                    <ui.HBox>
                        <div style={{paddingRight: 5}} onMouseOver={this.toggleCheckProbe.bind(this)} onMouseOut={this.toggleCheckProbe.bind(this)}>
                            <bs.Glyphicon glyph="ok" style={OKglyphStyle} ref={OKBUTTON}/>
                        </div>
                        <div onMouseOver={this.toggleRmProbe.bind(this)} onMouseOut={this.toggleRmProbe.bind(this)}>
                            <bs.Glyphicon glyph="remove" style={RMglyphStyle} ref={RMBUTTON}/>
                        </div>
                    </ui.HBox>
                </div>
                <div style={{display: "flex", flexDirection: "row", flex: 0.2}}>
                    <div style={{flex: 0.8}}>
                        <p style={{fontSize: "15px", color: "#34495e"}}>
                            {
                                data.header.toUpperCase()
                            }
                        </p>
                        <p style={{fontSize: "12px", color: "#34495e", whiteSpace: "nowrap"}} dangerouslySetInnerHTML={{__html: data.title}}>
                            {
                                //data.title
                            }
                        </p>
                    </div>
                    <div style={contactIcon}/>
                </div>
                <div style={{flex: 0.8}}>
                    <ui.HBox>
                        <div style={{width: "50%"}}>
                            <table style={{fontSize: "11px", color: "#93a5aa", marginRight: 5}}>
                                <tbody>
                                {
                                 rowsLeft
                                }
                                </tbody>
                            </table>
                        </div>
                        <div style={{width: "50%"}}>
                            <table style={{fontSize: "11px", color: "#93a5aa"}}>
                                <tbody>
                                {
                                    rowsRight
                                }
                                </tbody>
                            </table>
                        </div>
                    </ui.HBox>
                </div>
            </div>
        );
    }
}

export default CustomCardViewTool;

registerToolImplementation("CustomCardViewTool", CustomCardViewTool);
