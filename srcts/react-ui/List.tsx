import * as React from "react";
import * as ReactDOM from "react-dom";
import * as bs from "react-bootstrap";
import * as _ from "lodash";
import classNames from "../modules/classnames";
import {HBox, VBox} from "./FlexBox";
import MiscUtils from "../utils/MiscUtils";

export type ListOption = {
    value: any,
    label: string
}

export interface IListProps extends React.Props<List> {
    options: ListOption[];
    onChange?: (selectedValues: any[]) => void;
    selectedValues?: any[];
    allowClear?: boolean;
    multiple?: boolean;
    style?:React.CSSProperties;
    className?: string;
}

export interface IListState {
    selectedValues?: any[];
}

export default class List extends React.Component<IListProps, IListState>
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
        this.values = nextProps.options.map((option: ListOption) => option.value);
        this.labels = nextProps.options.map((option: ListOption) => option.label);
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
            <VBox style={{ flex: 1, overflow: "auto" }}>
                {
                    this.values.map((value: any, index: number) => {
                        var selected: boolean = this.state.selectedValues.indexOf(value) >= 0;

                        var style: React.CSSProperties = {
                            padding: 5,
							alignItems: "center",
							whiteSpace: "nowrap"
                        };

						var className = classNames({
                            'weave-list-Item' : true,
                            'weave-list-Item-selected': selected });

                        return (
                            <HBox key={index} style={_.merge(style, this.props.style)} className={ className }  onClick={this.handleChange.bind(this, value) }>
                                <span style={{ flex: 1 }}>{this.labels[index] || value}</span>
                            </HBox>
                        );
                    })
                }
            </VBox>
        );
    }
}
