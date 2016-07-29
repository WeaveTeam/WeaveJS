namespace weavejs.editor
{
	import IColumnReference = weavejs.api.data.IColumnReference;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IDataSource = weavejs.api.data.IDataSource;
	import CSVDataSource = weavejs.data.source.CSVDataSource;
	import List = weavejs.ui.List;
	import ListOption = weavejs.ui.ListOption;
	import VBox = weavejs.ui.flexbox.VBox;
	import HBox = weavejs.ui.flexbox.HBox;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;

	export interface CSVMetadataEditorProps extends React.Props<CSVMetadataEditor>
	{
		datasource:CSVDataSource;
		onChangeCallback:(newMetadata:MetadataEntry,selectedIds:Array<number|string>) => void;
	}

	export interface CSVMetadataEditorState
	{
		selected?:Array<number|string>;
		columnIds?:Array<number|string>;
	}


	export class CSVMetadataEditor extends React.Component<CSVMetadataEditorProps, CSVMetadataEditorState>
	{

		constructor(props:CSVMetadataEditorProps)
		{
			super(props);
			this.state = {
				columnIds:props.datasource.getColumnIds()
			};
			Weave.getCallbacks(props.datasource).addGroupedCallback(this,this.forceUpdate);
		}

		setSelectedColumnIds=(columnIds:Array<number|string>)=>
		{
			this.setState({
				selected: columnIds
			});
		};

		getSelectedColumnIds():Array<number|string>
		{
			var selected = this.state.selected;
			let columnIds = this.state.columnIds;
			if(!selected)
			{
				return columnIds && [columnIds[0]];
			}

			return this.state.columnIds && _.remove(this.state.columnIds.map( (columnId:number|string,index:number) => {
				if(_.includes(selected,columnId))
				{
					return this.state.columnIds && this.state.columnIds[index];
				}
			}),_.identity);
		}

		handleMetadataChange=(entry:MetadataEntry):void => {
			this.props.onChangeCallback(entry,this.getSelectedColumnIds());
			this.forceUpdate();
		};

		render():JSX.Element
		{
			let listOptions:ListOption[] = this.state.columnIds.map( (columnId:number|string) => {
				return {
					label: this.props.datasource.getColumnById(columnId).getMetadata(ColumnMetadata.TITLE),
					value: columnId
				};
			});
			let columnIds = this.getSelectedColumnIds();
			let entries:MetadataEntry[] = columnIds && columnIds.map( (columnId:number|string,index:number):MetadataEntry => {
					let column:IAttributeColumn = this.props.datasource.getColumnById(columnId);
					let metadataProps:string[] = column.getMetadataPropertyNames();
					return _.zipObject(metadataProps,metadataProps.map( (prop:string) => {
						return column.getMetadata(prop);
					}));
			});

			return (<HBox className="ui bottom attached segments" style={ {flex: 1, border: "none"} }  onMouseEnter={() => this.forceUpdate()} >
				<VBox style={{width: 250}}>
					<VBox className="ui vertical attached segments" style={{flex:1, justifyContent:"space-between",border:"none",borderRadius:0}}>
						<VBox className="ui basic segment" style={{flex: 1, overflow: "auto", padding: 0,border:"none",borderRadius:0}}>
							<div className="ui medium header" style={{padding: 0, paddingLeft: 14, paddingTop: 14}}>{Weave.lang("Columns")}</div>
							<VBox style={{alignItems: listOptions.length ? null:"center"}}>
								{
									listOptions.length
										?	<List
										options={listOptions}
										multiple={true}
										selectedValues={ this.state.selected || [this.state.columnIds[0]] }
										onChange={ (selectedValues:Array<number|string>) => { this.setSelectedColumnIds(selectedValues);  }}
									/>
										:	<div className="weave-list-item" style={{alignSelf: "flex-start", cursor: "default", pointerEvents: "none"}}>
										{Weave.lang("(None)")}
									</div>
								}
							</VBox>
						</VBox>
					</VBox>
				</VBox>
				<MetadataGrid
					entries={entries}
				    onChangeCallback={this.handleMetadataChange}
				/>
			</HBox>);
		}
	}
}
