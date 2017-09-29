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

namespace weavejs.api.core
{
	@Weave.classInfo({id: "weavejs.api.core.IClassRegistry"})
	export class IClassRegistry
	{
		/**
		 * Registers a class under a given qualified name and adds metadata about implementing interfaces.
		 * @param definition The class definition.
		 * @param qualifiedName The qualified class name under which to register the class definition.
		 * @param interfaces An Array of Class objects that are the interfaces the class implements.
		 * @param displayName An optional display name for the class definition.
		 */
		registerClass:(definition:GenericClass, qualifiedName:string, interfaces?:GenericClass[], displayName?:string) => void;
		
		/**
		 * Gets the qualified class name from a class definition or an object instance.
		 */
		getClassName:(definition:Object)=>string;
		
		/**
		 * Looks up a static definition by name.
		 */
		getDefinition:(name:string)=>GenericClass;
		
		/**
		 * Gets FlexJS class info.
		 * @param class_or_instance Either a Class or an instance of a Class.
		 * @return FlexJS class info object containing properties "variables", "accessors", and "methods",
		 *         each being an Array of Objects like {type:String, declaredBy:String}
		 */
		getClassInfo:(class_or_instance:Object)=>{
				variables: {[name:string]:{type: string}}[],
				accessors: {[name:string]:{type: string, declaredBy: string}}[],
				methods: {[name:string]:{type: string, declaredBy: string}}[]
			};
		
		/**
		 * This function returns the singleton instance for a registered interface.
		 *
		 * This method should not be called at static initialization time,
		 * because the implementation may not have been registered yet.
		 * 
		 * @param theInterface An interface to a singleton class.
		 * @return The singleton instance that implements the specified interface.
		 */
		getSingletonInstance:<T>(theInterface:Class<T>)=>T;
		
		/**
		 * This will register an implementation of an interface.
		 * @param theInterface The interface class.
		 * @param theImplementation An implementation of the interface.
		 * @param displayName An optional display name for the implementation.
		 */
		registerImplementation:<T>(theInterface:Class<T>, theImplementation:Class<T>, displayName?:string)=>void;
		
		/**
		 * This will get an Array of class definitions that were previously registered as implementations of the specified interface.
		 * @param theInterface The interface class.
		 * @return An Array of class definitions that were previously registered as implementations of the specified interface.
		 */
		getImplementations:<T>(theInterface:Class<T>)=>Class<T>[];
		
		/**
		 * This will get the displayName that was specified when an implementation was registered with registerImplementation().
		 * @param theImplementation An implementation that was registered with registerImplementation().
		 * @return The display name for the implementation.
		 */
		getDisplayName:(theImplementation:GenericClass)=>string;
	}
}
