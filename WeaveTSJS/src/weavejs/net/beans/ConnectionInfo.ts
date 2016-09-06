/* ***** BEGIN LICENSE BLOCK *****
 *
 * This file is part of Weave.
 *
 * The Initial Developer of Weave is the Institute for Visualization
 * and Perception Research at the University of Massachusetts Lowell.
 * Portions created by the Initial Developer are Copyright (C) 2008-2015
 * the Initial Developer. All Rights Reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * ***** END LICENSE BLOCK ***** */

namespace weavejs.net.beans
{
	export class ConnectionInfo
	{
		/*Bindable*/ public name:string = "";
		/*Bindable*/ public pass:string = "";
		/*Bindable*/ public folderName:string = "" ;
		/*Bindable*/ public connectString:string = "" ;
		/*Bindable*/ public is_superuser:boolean = false;
		
		/**
		 * This is a list of supported DBMS values.
		 */
		public static get dbmsList():string[]
		{
			return [ConnectionInfo.MYSQL, ConnectionInfo.POSTGRESQL, ConnectionInfo.SQLSERVER, ConnectionInfo.ORACLE, ConnectionInfo.SQLITE];
		}
		
		public static /* readonly */ MYSQL:string = 'MySQL';
		public static /* readonly */ POSTGRESQL:string = 'PostGreSQL';
		public static /* readonly */ SQLSERVER:string = 'Microsoft SQL Server';
		public static /* readonly */ ORACLE:string = 'Oracle';
		public static /* readonly */ SQLITE:string = 'SQLite';
		
		public static  /* readonly */ DIRECTORY_SERVICE_CONNECTION_NAME:string = 'Directory Service';
		
		/**
		 * This function will get the default port for a DBMS.
		 * @param dbms A supported DBMS.
		 * @return The default port for the dbms.
		 */
		public static getDefaultPort(dbms:string):int
		{
			switch (dbms)
			{
				case ConnectionInfo.MYSQL: return 3306;
				case ConnectionInfo.POSTGRESQL: return 5432;
				case ConnectionInfo.SQLSERVER: return 1433;
				case ConnectionInfo.ORACLE: return 1521;
				case ConnectionInfo.SQLITE: return 0;
			}
			return 0;
		}
	}
}