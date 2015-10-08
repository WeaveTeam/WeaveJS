import React from "react";
import * as bs from "react-bootstrap";
import _ from "lodash";
import {registerToolImplementation} from "./WeaveTool.jsx";

var cardStyle = {
    height: "150",
    width: "300",
    marginLeft: "5",
    marginRight: "5",
    border: "solid",
    padding: "5px",
    borderWidth: "2px",
    borderColor: "#EBEBEB",
    boxShadow: "0 1px 1px rgba(0,0,0,.05)",
    float: "left"
};

export default class CustomCardViewTool extends React.Component {


    constructor(props) {
        super(props);

        this.toolPath = this.props.toolPath;
        this.headerPath = this.props.toolPath.push("header");
        this.titlePath = this.props.toolPath.push("title");
        this.attributesPath = this.props.toolPath.push("attributes");
        this.formattedRecords = [];
    }

    componentDidMount() {
        this.toolPath.addCallback(this.dataChanged.bind(this), true, false);

    }

    dataChanged() {

        var mapping = {
            header: this.headerPath.getNames().map((name) => { return this.headerPath.push(name); }),
            title: this.titlePath.getNames().map((name) => { return this.titlePath.push(name); }),
            attributes: this.attributesPath.getNames().map((name) => { return this.attributesPath.push(name); })
        };

        console.log(mapping);

        var attributeNames = this.attributesPath.getNames();

        this.records = this.toolPath.retrieveRecords(mapping);
        console.log(this.records);

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

            var attributes = [];
            if(record.hasOwnProperty("attributes")) {
                for(var i in attributeNames) {
                    attributes.push({
                        name: this.attributesPath.push(attributeNames[i]).getValue("getMetadata('title')"),
                        value: record.attributes[i]
                    });
                }
            }

            formattedRecord.attributes = attributes;

            formattedRecord.imgUrl = record.imgUrl;
            return formattedRecord;
        });
        this.forceUpdate();
    }

    handleWeaveState() {

    }

    componentDidUpdate() {

    }

    render() {
        var cards = this.formattedRecords.map((formattedRecord, index) => {
            return <Card data={formattedRecord} key={index}/>;
        });

        return (
            <div>
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
    }

    render() {

        var data = this.props.data;

        var contactIcon = {
            flex: 0.2,
            backgroundColor: "white",
            backgroundAlpha: "1",
            backgroundImage: "url(img/contact-icon.png)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center"
        };


        var rows = data.attributes.map((attribute, index) => {
            return (
                <tr key={index}>
                  <th>{attribute.name}</th>
                  <td>{attribute.value}</td>
                </tr>
            );
        });

        return (
            <div style={cardStyle}>
                <div style={{display: "flex", flexDirection: "row", flex: 0.2}}>
                    <div style={{flex: 0.8}}>
                        <p style={{fontSize: "15px"}}>
                            {
                                data.header
                            }
                        </p>
                        <p style={{fontSize: "12px"}}>
                            {
                                data.title
                            }
                        </p>
                    </div>
                    <div style={contactIcon}/>
                </div>
                <div style={{flex: 0.8}}>
                    <table style={{width: "100%", fontSize: "11px"}}>
                      {
                        rows
                      }
                    </table>
                </div>
            </div>
        );
    }
}

registerToolImplementation("CustomCardViewTool", CustomCardViewTool);
