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

namespace weavejs.geom
{
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import ILinkableVariable = weavejs.api.core.ILinkableVariable;
	import StandardLib = weavejs.util.StandardLib;

	export declare type CenteredAreaBound = {
		xCenter: number,
		yCenter: number,
		area:number
	};
	export declare type ZoomBound = CenteredAreaBound | Bounds2D;

	/**
	 * This object defines the data bounds of a visualization, either directly with
	 * absolute coordinates or indirectly with center coordinates and area.
	 * Screen coordinates are never directly specified in the session state.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.geom.ZoomBounds"})
	export class ZoomBounds implements ILinkableVariable
	{
		constructor()
		{
		}
		
		private /* readonly */ _tempBounds:Bounds2D = new Bounds2D(); // reusable temporary object
		private /* readonly */ _dataBounds:Bounds2D = new Bounds2D();
		private /* readonly */ _screenBounds:Bounds2D = new Bounds2D();
		private _useFixedAspectRatio:boolean = false;
		
		/**
		 * The session state has two modes: absolute coordinates and centered area coordinates.
		 * @return The current session state.
		 */		
		public getSessionState():ZoomBound
		{
			if (this._useFixedAspectRatio)
			{
				return {
					xCenter: StandardLib.roundSignificant(this._dataBounds.getXCenter()),
					yCenter: StandardLib.roundSignificant(this._dataBounds.getYCenter()),
					area: StandardLib.roundSignificant(this._dataBounds.getArea())
				};
			}
			else
			{
				return {
					xMin: this._dataBounds.getXMin(),
					yMin: this._dataBounds.getYMin(),
					xMax: this._dataBounds.getXMax(),
					yMax: this._dataBounds.getYMax()
				} as Bounds2D;
			}
		}
		
		/**
		 * The session state can be specified in two ways: absolute coordinates and centered area coordinates.
		 * @param The new session state.
		 */		
		public setSessionState(state:ZoomBound):void
		{
			var cc:ICallbackCollection = Weave.getCallbacks(this);
			cc.delayCallbacks();
			
			if (state == null)
			{
				if (!this._dataBounds.isUndefined())
					cc.triggerCallbacks();
				this._dataBounds.reset();
			}
			else
			{
				var useFixedAspectRatio:boolean = false;
				if (state.hasOwnProperty("xCenter"))
				{
					useFixedAspectRatio = true;
					if (StandardLib.roundSignificant(this._dataBounds.getXCenter()) != (state as CenteredAreaBound).xCenter)
					{
						this._dataBounds.setXCenter((state as CenteredAreaBound).xCenter);
						cc.triggerCallbacks();
					}
				}
				if (state.hasOwnProperty("yCenter"))
				{
					useFixedAspectRatio = true;
					if (StandardLib.roundSignificant(this._dataBounds.getYCenter()) != (state as CenteredAreaBound).yCenter)
					{
						this._dataBounds.setYCenter((state as CenteredAreaBound).yCenter);
						cc.triggerCallbacks();
					}
				}
				if (state.hasOwnProperty("area"))
				{
					useFixedAspectRatio = true;
					if (StandardLib.roundSignificant(this._dataBounds.getArea()) != (state as CenteredAreaBound).area)
					{
						// We can't change the screen area.  Adjust the dataBounds to match the specified area.
						/*
							Ad = Wd * Hd
							Wd/Hd = Ws/Hs
							Wd = Hd * Ws/Hs
							Ad = Hd^2 * Ws/Hs
							Hd^2 = Ad * Hs/Ws
							Hd = sqrt(Ad * Hs/Ws)
						*/
						
						var Ad:number = (state as CenteredAreaBound).area;
						var HsWsRatio:number = this._screenBounds.getYCoverage() / this._screenBounds.getXCoverage();
						if (!isFinite(HsWsRatio)) // handle case if screenBounds is undefined
							HsWsRatio = 1;
						var Hd:number = Math.sqrt(Ad * HsWsRatio);
						var Wd:number = Ad / Hd;
						this._dataBounds.centeredResize(Wd, Hd);
						cc.triggerCallbacks();
					}
				}
				
				if (!useFixedAspectRatio)
				{
					var names:string[] = ["xMin", "yMin", "xMax", "yMax"];
					for (var name of names || [])
					{
						if ((state as any).hasOwnProperty(name) && (this._dataBounds as any)[name] != (state as any)[name])
						{
							(this._dataBounds as any)[name] = (state as any)[name];
							cc.triggerCallbacks();
						}
					}
				}
				
				this._useFixedAspectRatio = useFixedAspectRatio;
			}
			
			cc.resumeCallbacks();
		}
		
		/**
		 * This function will copy the internal dataBounds to another IBounds2D.
		 * @param outputScreenBounds The destination.
		 */
		public getDataBounds(outputDataBounds:Bounds2D):void
		{
			outputDataBounds.copyFrom(this._dataBounds);
		}
		
		/**
		 * This function will copy the internal screenBounds to another IBounds2D.
		 * @param outputScreenBounds The destination.
		 */
		public getScreenBounds(outputScreenBounds:Bounds2D):void
		{
			outputScreenBounds.copyFrom(this._screenBounds);
		}
		
		/**
		 * This will project a Point from data coordinates to screen coordinates.
		 * @param inputAndOutput The Point object containing output coordinates.  Reprojected coordinates will be stored in this same Point object.
		 */
		public projectDataToScreen(inputAndOutput:Point):void
		{
			this._dataBounds.projectPointTo(inputAndOutput, this._screenBounds);
		}
		
		/**
		 * This will project a Point from screen coordinates to data coordinates.
		 * @param inputAndOutput The Point object containing output coordinates.  Reprojected coordinates will be stored in this same Point object.
		 */
		public projectScreenToData(inputAndOutput:Point):void
		{
			this._screenBounds.projectPointTo(inputAndOutput, this._dataBounds);
		}
		
		/**
		 * This function will set all the information required to define the session state of the ZoomBounds.
		 * @param dataBounds The data range of a visualization.
		 * @param screenBounds The pixel range of a visualization.
		 * @param useFixedAspectRatio Set this to true if you want to maintain an identical x and y data-per-pixel ratio.
		 */		
		public setBounds(dataBounds:Bounds2D, screenBounds:Bounds2D, useFixedAspectRatio:boolean):void
		{
			if (this._dataBounds.equals(dataBounds) && this._screenBounds.equals(screenBounds) && this._useFixedAspectRatio == useFixedAspectRatio)
				return;
			
			this._dataBounds.copyFrom(dataBounds);
			this._screenBounds.copyFrom(screenBounds);
			this._useFixedAspectRatio = useFixedAspectRatio;
			this._fixAspectRatio();
			
			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		/**
		 * This function will zoom to the specified dataBounds and fix the aspect ratio if necessary.
		 * @param dataBounds The bounds to zoom to.
		 * @param zoomOutIfNecessary Set this to true if you are using a fixed aspect ratio and you want the resulting fixed bounds to be expanded to include the specified dataBounds.
		 */
		public setDataBounds(dataBounds:Bounds2D, zoomOutIfNecessary:Boolean = false):void
		{
			if (this._dataBounds.equals(dataBounds))
				return;
			
			this._dataBounds.copyFrom(dataBounds);
			this._fixAspectRatio(zoomOutIfNecessary);
			
			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		/**
		 * This function will update the screenBounds and fix the aspect ratio of the dataBounds if necessary.
		 * @param screenBounds The new screenBounds.
		 * @param useFixedAspectRatio Set this to true if you want to maintain an identical x and y data-per-pixel ratio.
		 */
		public setScreenBounds(screenBounds:Bounds2D, useFixedAspectRatio:boolean):void
		{
			if (this._useFixedAspectRatio == useFixedAspectRatio && this._screenBounds.equals(screenBounds))
				return;
			
			this._useFixedAspectRatio = useFixedAspectRatio;
			this._screenBounds.copyFrom(screenBounds);
			this._fixAspectRatio();
			
			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		private _fixAspectRatio(zoomOutIfNecessary:Boolean = false):void
		{
			if (this._useFixedAspectRatio && !this._screenBounds.isEmpty())
			{
				var xInvScale:number = this._dataBounds.getXCoverage() / this._screenBounds.getXCoverage();
				var yInvScale:number = this._dataBounds.getYCoverage() / this._screenBounds.getYCoverage();
				if (xInvScale != yInvScale)
				{
					var scale:number = zoomOutIfNecessary ? Math.max(xInvScale, yInvScale) : Math.sqrt(xInvScale * yInvScale);
					this._dataBounds.centeredResize(this._screenBounds.getXCoverage() * scale, this._screenBounds.getYCoverage() * scale);
				}
			}
		}
		
		/**
		 * A scale of N means there is an N:1 correspondance of pixels to data coordinates.
		 */		
		public getXScale():number
		{
			return this._screenBounds.getXCoverage() / this._dataBounds.getXCoverage();
		}
		
		/**
		 * A scale of N means there is an N:1 correspondance of pixels to data coordinates.
		 */		
		public getYScale():number
		{
			return this._screenBounds.getYCoverage() / this._dataBounds.getYCoverage();
		}
	}
}
