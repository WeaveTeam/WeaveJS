import * as React from "react";
import * as ReactDOM from "react-dom";
import * as bs from "react-bootstrap";
import * as _ from "lodash";
import {HBox, VBox} from "./FlexBox";
import MiscUtils from "../utils/MiscUtils";

export type ListOption = {
    value: any,
    label: string
}

export interface IListProps extends React.Props<ListItem> {
    options: ListOption[];
    onChange?: (selectedValues: any[]) => void;
    selectedValues?: any[];
    allowClear?: boolean;
    multiple?: boolean;
}

export interface IListState {
    selectedValues?: any[];
    hovered?: number;
}

export default class ListItem extends React.Component<IListProps, IListState>
{
    private checkboxes: HTMLElement[];
    private lastIndexClicked: number;
    private selectedValues: any[];
    private values: any[];
    private labels: string[];

    constructor(props: IListProps) {
        super(props);
        this.state = {
            selectedValues: props.selectedValues || []
        };
        if (props.selectedValues) {
            this.lastIndexClicked = props.selectedValues.length - 1;
        }
        if (this.props.options && this.props.options.length) {
            this.values = this.props.options.map((option: ListOption) => option.value);
            this.labels = this.props.options.map((option: ListOption) => option.label);
        }
        else {
            this.values = [];
            this.labels = [];
        }
    }

    static defaultProps(): IListProps {
        return {
            options: [],
            multiple: true,
            allowClear: true
        };
    }

    componentWillReceiveProps(nextProps: IListProps) {
        this.values = this.props.options.map((option: ListOption) => option.value);
        this.labels = this.props.options.map((option: ListOption) => option.label);
        if (nextProps.selectedValues) {
            this.setState({
                selectedValues: nextProps.selectedValues
            });
        }
    }

    handleChange(value: any, event: React.MouseEvent) {
        var selectedValues: any[] = this.state.selectedValues.concat();
        // new state of the item in the list
        var currentIndexClicked: number = selectedValues.indexOf(value);

        // ctrl selection
        if (event.ctrlKey || event.metaKey) {
            if (currentIndexClicked > -1) {
                selectedValues.splice(currentIndexClicked, 1);
            }
            else {
                selectedValues.push(value);
            }
            this.lastIndexClicked = currentIndexClicked;
        }
        // multiple selection
        else if (event.shiftKey && this.props.multiple) {
            selectedValues = [];
            if (this.lastIndexClicked == null) {
                // do nothing
            }
            else {
                var start: number = this.lastIndexClicked;
                var end: number = this.values.indexOf(value);

                if (start > end) {
                    let temp: number = start;
                    start = end;
                    end = temp;
                }

                for (var i: number = start; i <= end; i++) {
                    selectedValues.push(this.values[i]);
                }
            }
        }
        // single selection
        else {
            // if there was only one record selected
            // and we are clicking on it again, then we want to
            // clear the selection unless allowClear is not enabled.
            if (selectedValues.length == 1 && selectedValues[0] == value && this.props.allowClear) {
                selectedValues = [];
                this.lastIndexClicked = null;
            }
            else {
                selectedValues = [value];
                this.lastIndexClicked = this.values.indexOf(value);
            }
        }

        if (this.props.onChange)
            this.props.onChange(selectedValues);


        this.setState({
            selectedValues
        });
    }

    render(): JSX.Element {
        return (
            <div style={{ flex: 1, overflow: "auto" }}>
                {
                    this.values.map((value: any, index: number) => {
                        var hovered: boolean = this.state.hovered == index;
                        var selected: boolean = this.state.selectedValues.indexOf(value) >= 0;

                        var style: React.CSSProperties = {
                            padding: 5,
                            height: 30,
                            width: "100%",
							whiteSpace: "nowrap"
                        };

                        if (selected && hovered)
                            style["backgroundColor"] = "#99D6FF";

                        if (selected && !hovered)
                            style["backgroundColor"] = "#80CCFF";

                        if (!selected && hovered) {
                            style["backgroundColor"] = MiscUtils.rgba(153, 214, 255, 0.4);
                        }

                        if (!selected && !hovered)
                            style["backgroundColor"] = "#FFFFFF";

                        return (
                            <HBox key={index} style={style} onMouseOver={(event: React.MouseEvent) => { this.setState({ hovered: index }) } } onClick={this.handleChange.bind(this, value) }>
                                <span style={{ flex: 1 }}>{this.labels[index] || value}</span>
                            </HBox>
                        );
                    })
                }
            </div>
        );
    }
}
