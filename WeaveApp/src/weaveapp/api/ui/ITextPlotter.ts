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
import {Weave} from "weavejs";
import IPlotter from "weaveapp/api/ui/IPlotter";

/**
 * A class implementing this interface is an IPlotter that renders text graphics.
 */
export interface ITextPlotter extends IPlotter
{
}

export class ITextPlotter
{
	static WEAVE_INFO = Weave.classInfo(ITextPlotter, {
		id: "weavejs.api.ui.ITextPlotter",
		interfaces: [IPlotter]
	});
}

export default ITextPlotter;
