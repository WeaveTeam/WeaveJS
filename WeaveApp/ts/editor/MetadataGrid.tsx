import * as React from "react";
import * as weavejs from "weavejs";
import * as _ from "lodash";
import {Weave} from "weavejs";

import IColumnReference = weavejs.api.data.IColumnReference;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IDataSource = weavejs.api.data.IDataSource;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import EditableTextCell = weavejs.ui.EditableTextCell;
import ComboBox = weavejs.ui.ComboBox;
import VBox = weavejs.ui.flexbox.VBox;
import HBox = weavejs.ui.flexbox.HBox;
import ComboBoxOption = weavejs.ui.ComboBoxOption;
import EntityMetadata = weavejs.api.net.beans.EntityMetadata;
import {IRow} from "../ui/DataTable";

export type MetadataEntry = {[key:string]:any};

export interface MetadataGridProps extends React.Props<MetadataGrid>
{
	entries:MetadataEntry[];
	onChangeCallback:(entry:MetadataEntry) => void;
}

export interface MetadataGridState
{
	entry:MetadataEntry;
	properties?:string[];
}


export default class MetadataGrid extends React.Component<MetadataGridProps, MetadataGridState>
{

	constructor(props:MetadataGridProps)
	{
		super(props);
		let entry:MetadataEntry = {};
		this.state = {
			entry
		};
	}

	componentWillReceiveProps(nextProps:MetadataGridProps)
	{
		if(!_.isEqual(this.props.entries,nextProps.entries))
		{
			let entry:MetadataEntry = {};
			this.setState({
				entry
			});
		}
	}

	getEditor(entry:MetadataEntry, key:string, value:any):JSX.Element
	{
		let valueArray:boolean = Array.isArray(value);
		let entryCopy:MetadataEntry = _.cloneDeep(entry);
		let dedupedValues = valueArray && _.uniq(value);
		let options:ComboBoxOption[];
		if(valueArray && dedupedValues.length > 1)
		{
			options = dedupedValues.map( (val:any, index:number) => {
				return {label: String(val),value:val} as ComboBoxOption;
			});
			return <HBox overflow style={{flex: 1}}>
				<ComboBox
					style={{width: "100%"}}
					noneOption={{label:"(None)", value:null}}
					options={options}
					placeholder={Weave.lang("(Multiple Values)")}
					allowAdditions={true}
					searchable={true}
					onChange={(val:any) => {
						entry[key] = val;
						this.props.onChangeCallback(entry);
					}}
			/></HBox>;
		}
		let singleValue = valueArray? value[0]:value;

		options = ColumnMetadata.getSuggestedPropertyValues(key).map( (value:string, index:number) => {
			return {label:value, value}	as ComboBoxOption;
		});

		switch (key) {
			case ColumnMetadata.KEY_TYPE:
				return <div className="weave-input-div disabled">{singleValue}</div>;
			case ColumnMetadata.AGGREGATION:
			case ColumnMetadata.DATA_TYPE:
			case ColumnMetadata.DATE_DISPLAY_FORMAT:
			case ColumnMetadata.DATE_FORMAT:
				return <HBox overflow style={{flex: 1}}>
					<ComboBox
						style={{width: "100%"}}
						value={singleValue}
						noneOption={{label:"(None)", value:null}}
						options={options}
						allowAdditions={true}
						searchable={true}
						onChange={(val:any) => {
							entry[key] = val;
							this.props.onChangeCallback(entry);
						}}
					/>
				</HBox>;
			case ColumnMetadata.MAX:
			case ColumnMetadata.MIN:
			case ColumnMetadata.NUMBER:
			case ColumnMetadata.OVERRIDE_BINS:
			case ColumnMetadata.STRING:
			case ColumnMetadata.TITLE:
			default:
				return <EditableTextCell
					style={{flex: 1}}
					textContent={singleValue}
					emptyText={Weave.lang("Double click to edit")}
					onChange={(val:string) => {
						entry = _.set(entry,key,val);
						this.props.onChangeCallback(entry);}
					}
				/>;
		}
	}

	getCombinedEntry():MetadataEntry
	{
		let combined:MetadataEntry = _.merge(this.state.entry,{});
		if(this.props.entries)
		{
			if(this.props.entries.length > 1)
			{
				//multi entry case
				this.props.entries.forEach( (entry:MetadataEntry) => {
					_.forEach(entry, (value:any, key:string) => {
						if(!combined[key])
						{
							combined[key] = [value];
						} else if (combined[key] && !_.includes(combined[key],value)){
							combined[key].push(value);
						}
					});
				});
			}
			else
			{
				//single entry case
				_.forEach(this.props.entries[0], (value:any, key:string) => {
					combined[key] = value;
				});
			}
		}
		return combined;
	}

	render():JSX.Element
	{

		let rows:IRow[] = [];
		let entry:MetadataEntry = this.getCombinedEntry();

		if(entry)
			rows = _.map(entry, (value:any,key:string) => {
				return {
					property:key,
					value: this.getEditor(entry,key,value)
				} as IRow
			});
		let columnIds = ["property","value"];
		let columnTitles: {[columnId: string]: string|JSX.Element} = {property:Weave.lang("Property"),value:Weave.lang("Value")};

		let options:ComboBoxOption[] = _.difference(EntityMetadata.getSuggestedPublicPropertyNames(),_.keys(entry)).map( (name:any,index:number) => {
			return {label: String(name), value: name} as ComboBoxOption;
		});

		let cellStyle:React.CSSProperties = {border: "1px solid #dddddd", textAlign: "left", padding: 8};

		return (
			<VBox style={{flex: 1}}>
				<VBox style={{flex: 1, border: "1px solid #D6D6D6", overflowX: "hidden"}}>
					<table style={{borderCollapse: "collapse", width: "100%"}}>
						<thead>
							<tr>
								{_.keys(columnTitles).map((key:string,index:number) => {
									return <th key={index}>
										{columnTitles[key]}
									</th>
								})}
							</tr>
						</thead>
						<tbody>
							{rows.map((row:IRow,index:number) => {
								return <tr key={index}>
									{_.keys(row).map((key:string,i:number) => {
										return <td key={i} style={cellStyle}>{row[key]}</td>;
									})}
								</tr>
							})}
						</tbody>
					</table>
				</VBox>
				<HBox overflow>
					{Weave.lang("Add property:")}
					<ComboBox style={{width: "100%"}}
							  value={null}
							  placeholder={Weave.lang("Add a new property...")}
							  noneOption={{label:"(None)", value:null}}
							  options={options}
							  allowAdditions={true}
							  searchable={true}
							  direction="upward"
							  onChange={(val:any) => {
								//add metadata option to grid
								let propertyValues:string[] = ColumnMetadata.getSuggestedPropertyValues(val);
								entry[val] = (propertyValues && propertyValues[0]) || undefined;
								this.setState({entry});
								this.props.onChangeCallback(entry);
							  }}
							  onAddNewOption={(val:any) => {
								//add new metadata option to grid
								entry[val] = undefined;
								this.setState({entry});
								this.props.onChangeCallback(entry);
							  }}
					/>
				</HBox>
			</VBox>);
	}
}