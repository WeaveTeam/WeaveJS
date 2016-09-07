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

namespace weavejs.api.data
{
	import IDataSource = weavejs.api.data.IDataSource;

	@Weave.classInfo({id: "weavejs.api.data.IDataSourceWithAuthentication"})
	export class IDataSourceWithAuthentication extends IDataSource
	{
		/**
		 * Check this to determine if authenticate() may be necessary.
		 * @return true if authenticate() may be necessary.
		 */
		authenticationSupported:boolean;
		
		/**
		 * Check this to determine if authenticate() must be called.
		 * @return true if authenticate() should be called.
		 */
		authenticationRequired:boolean;
		
		/**
		 * The username that has been successfully authenticated.
		 */
		authenticatedUser:string;
		
		/**
		 * Authenticates with the server.
		 * @param user
		 * @param pass
		 */
		authenticate:(user:string, pass:string)=>void;
	}
}
