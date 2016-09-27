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

namespace weavejs.core
{
	import IClassRegistry = weavejs.api.core.IClassRegistry;

	export declare type ClassInfo = {
		name?: string,
		names?: string[]
		qName?: string,
		interfaces?: GenericClass[]
	};
	/**
	 * Manages a set of implementations of interfaces.
	 */
	@Weave.classInfo({id: "weavejs.core.ClassRegistryImpl", interfaces: [IClassRegistry]})
	export class ClassRegistryImpl implements IClassRegistry
	{
		constructor()
		{
		}
		
		/**
		 * interface Class -&gt; singleton implementation instance.
		 */
		public/* readonly */ map_interface_singletonInstance = new Map<GenericClass, GenericClass>();
		
		/**
		 * interface Class -&gt; Array&lt;implementation Class&gt;
		 */
		public/* readonly */ map_interface_implementations = new Map<GenericClass, GenericClass[]>();
		
		/**
		 * implementation Class -&gt; String
		 */
		public/* readonly */ map_class_displayName = new Map<GenericClass, string>();
		
		/**
		 * qualifiedName:String -> definition:Class
		 */
		public/* readonly */ map_name_class = new Map<string, GenericClass>();
		
		/**
		 * definition:Class -> qualifiedName:String
		 */
		public/* readonly */ map_class_name = new Map<GenericClass, string>();
		
		/**
		 * An Array of default packages to check when looking up a class by name.
		 */
		public/* readonly */ defaultPackages:string[] = [];
		
		private static/* readonly */ FLEXJS_CLASS_INFO:string = "FLEXJS_CLASS_INFO";

		public registerClass(definition:GenericClass, qualifiedName:string, interfaces:GenericClass[] = null, displayName:string = null):void
		{
			// register qualified name
			if (!this.map_name_class.has(qualifiedName))
				this.map_name_class.set(qualifiedName, definition);
			if (!this.map_class_name.has(definition))
				this.map_class_name.set(definition, qualifiedName);
			
			// register short name
			var shortName:string = qualifiedName.split('.').pop().split(':').pop();
			if (!this.map_name_class.has(shortName))
				this.map_name_class.set(shortName, definition);
			
			var info:ClassInfo;
			var items:any[];
			var item:any;
			
			// get class info
			if (Object(definition.prototype).hasOwnProperty(ClassRegistryImpl.FLEXJS_CLASS_INFO))
				info = definition.prototype[ClassRegistryImpl.FLEXJS_CLASS_INFO];
			else
				info = definition.prototype[ClassRegistryImpl.FLEXJS_CLASS_INFO] = {};
			
			// add name if not present
			var found:boolean = false;
			items = info.names || (info.names = []);
			for (item in items || [])
			{
				if (item.qName == qualifiedName)
				{
					found = true;
					break;
				}
			}
			if (!found)
			{
				item = {};
				item.name = shortName;
				item.qName = qualifiedName;
				items.push(item);
			}
			
			// add interfaces if not present
			items = info.interfaces || (info.interfaces = []);
			for (item of interfaces || [])
			{
				if (items.indexOf(item) < 0)
					items.push(item);
				this.registerImplementation(item, definition, displayName);
			}
		}
		
		public getClassName(definition:GenericClass):string
		{
			if (!definition)
				return null;
			
			if (!definition.prototype)
				definition = (definition as any).constructor;
			
			if (definition.prototype && definition.prototype[ClassRegistryImpl.FLEXJS_CLASS_INFO])
				return definition.prototype[ClassRegistryImpl.FLEXJS_CLASS_INFO].names[0].qName;
			
			if (this.map_class_name.has(definition))
				return this.map_class_name.get(definition);
			
			return definition.name;
		}
		
		public getDefinition(name:string):GenericClass
		{
			// check cache
			var def:GenericClass = this.map_name_class.get(name);
			if (def || !name)
				return def;
			
			// try following chain of property names from global scope
			def = this.evalChain(name);
			
			// check default packages
			if (!def)
			{
				var shortName:string = name.split('.').pop().split('::').pop();
				for (var pkg of this.defaultPackages || [])
				{
					var qName:string = pkg ? pkg + '.' + shortName : shortName;
					def = this.map_name_class.get(qName) || this.evalChain(qName);
					if (def)
						break;
				}
			}
			
			// save in cache
			if (def)
				this.map_name_class.set(name, def);
			
			return def;
		}
		
		private evalChain(name:string):GenericClass
		{
			var chain:string[]  = name.split('.');
			var def:GenericClass = window as any; // TODO check this
			for (var key of chain || [])
			{
				if (!def)
					break;
				
				try
				{
					def = (def as any)[key];
				}
				catch (e)
				{
					def = undefined;
				}
			}
			return def;
		}
		
		public getClassInfo(class_or_instance:GenericClass):{
			variables: {[name:string]:{type: string}}[],
			accessors: {[name:string]:{type: string, declaredBy: string}}[],
			methods: {[name:string]:{type: string, declaredBy: string}}[]
			}
		{
			if (!class_or_instance)
				return null;
			if (!class_or_instance.prototype)
				class_or_instance = (class_or_instance as any).constructor;
			var info:any = class_or_instance && class_or_instance.prototype && class_or_instance.prototype.FLEXJS_REFLECTION_INFO;
			if (Weave.IS(info, Function))
			{
				info = info();
				info.variables = info.variables();
				info.accessors = info.accessors();
				info.methods = info.methods();
			}
			return info;
		}
		
		public getSingletonInstance<T>(theInterface:Class<T>):T
		{
			if (!this.map_interface_singletonInstance.get(theInterface))
			{
				var classDef:Class<T> = this.getImplementations(theInterface)[0];
				if (classDef)
					this.map_interface_singletonInstance.set(theInterface, new classDef());
			}
			
			return this.map_interface_singletonInstance.get(theInterface);
		}
		
		public registerImplementation(theInterface:GenericClass, theImplementation:GenericClass, displayName:string = null):void
		{
			this.verifyImplementation(theInterface, theImplementation);
			
			var array = this.map_interface_implementations.get(theInterface);
			if (!array)
				this.map_interface_implementations.set(theInterface, array = []);
			
			// overwrite existing displayName if specified
			if (displayName || !this.map_class_displayName.get(theImplementation))
				this.map_class_displayName.set(theImplementation, displayName || this.getClassName(theImplementation).split(':').pop());
			
			if (array.indexOf(theImplementation) < 0)
			{
				array.push(theImplementation);
				// sort by displayName
				array.sort(this.compareDisplayNames);
			}
		}
		
		public getImplementations(theInterface:GenericClass):GenericClass[]
		{
			var array = this.map_interface_implementations.get(theInterface);
			return array ? array.concat() : [];
		}
		
		public getDisplayName(theImplementation:GenericClass):string
		{
			var str:string = this.map_class_displayName.get(theImplementation);
			return str;// && lang(str);
		}
		
		/**
		 * @private
		 * sort by displayName
		 */
		private compareDisplayNames(impl1:GenericClass, impl2:GenericClass):int
		{
			var name1:string = this.map_class_displayName.get(impl1);
			var name2:string = this.map_class_displayName.get(impl2);
			if (name1 < name2)
				return -1;
			if (name1 > name2)
				return 1;
			return 0;
		}
		
		/**
		 * Verifies that a Class implements an interface.
		 */
		public verifyImplementation(theInterface:GenericClass, theImplementation:GenericClass):void
		{
			if (!theInterface)
				throw new Error("interface cannot be " + theInterface + " check " + theImplementation);
			if (!theImplementation)
				throw new Error("implementation cannot be " + theImplementation);
			if (!Weave.IS(theImplementation.prototype, theInterface))
				throw new Error(this.getClassName(theImplementation) + ' does not implement ' + this.getClassName(theInterface));
		}
		
		/**
		 * Partitions a list of classes based on which interfaces they implement.
		 * @param A list of interfaces.
		 * @return An Array of filtered Arrays corresponding to the given interfaces, including a final
		 *         Array containing the remaining classes that did not implement any of the given interfaces.
		 */
		public static partitionClassList(classes:GenericClass[], ...interfaces:GenericClass[]):GenericClass[][]
		{
			if (interfaces.length == 1 && Weave.IS(interfaces[0], Array))
				interfaces = interfaces[0] as any;
			var partitions:GenericClass[][] = [];
			for (var interfaceClass of interfaces || [])
			{
				var partition:GenericClass[] = [];
				classes = classes.filter(function(impl:GenericClass):boolean {
					if (Weave.IS(impl.prototype,interfaceClass))
					{
						// include in result, remove from from classes
						partition.push(impl);
						return false;
					}
					return true;
				});
				partitions.push(partition);
			}
			partitions.push(classes);
			return partitions;
		}
	}
}
