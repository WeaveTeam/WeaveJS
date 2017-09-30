/*
amf.js - An AMF library in JavaScript (ported to ActionScript for Weave)

Copyright (c) 2010, James Ward - www.jamesward.com
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY JAMES WARD ''AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JAMES WARD OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those of the
authors and should not be interpreted as representing official policies, either expressed
or implied, of James Ward.
*/
namespace weavejs.util
{

	export declare type Trait = {
		properties?: string[],
		externalizable?: boolean,
		dynamic?:boolean,
		count?: number,
		className?: string
	};

	export class JSByteArray
	{
		public /* readonly */ ENCODING_AMF0:int = 0;
		public /* readonly */ ENCODING_AMF3:int = 3;
		
		private /* readonly */ AMF0_Number:int        =  0;
		private /* readonly */ AMF0_Boolean:int       =  1;
		private /* readonly */ AMF0_String:int        =  2;
		private /* readonly */ AMF0_Object:int        =  3;
		private /* readonly */ AMF0_MovieClip:int     =  4;
		private /* readonly */ AMF0_Null:int          =  5;
		private /* readonly */ AMF0_Undefined:int     =  6;
		private /* readonly */ AMF0_Reference:int     =  7;
		private /* readonly */ AMF0_ECMAArray:int     =  8;
		private /* readonly */ AMF0_ObjectEnd:int     =  9;
		private /* readonly */ AMF0_StrictArray:int   = 10;
		private /* readonly */ AMF0_Date:int          = 11;
		private /* readonly */ AMF0_LongString:int    = 12;
		private /* readonly */ AMF0_Unsupported:int   = 13;
		private /* readonly */ AMF0_Recordset:int     = 14;
		private /* readonly */ AMF0_XMLObject:int     = 15;
		private /* readonly */ AMF0_TypedObject:int   = 16;
		private /* readonly */ AMF0_AvmPlusObject:int = 17;
		
		private /* readonly */ AMF3_Undefined:int  = 0;
		private /* readonly */ AMF3_Null:int       = 1;
		private /* readonly */ AMF3_False:int      = 2;
		private /* readonly */ AMF3_True:int       = 3;
		private /* readonly */ AMF3_Integer:int    = 4;
		private /* readonly */ AMF3_Double:int     = 5;
		private /* readonly */ AMF3_String:int     = 6;
		private /* readonly */ AMF3_XML:int        = 7;
		private /* readonly */ AMF3_Date:int       = 8;
		private /* readonly */ AMF3_Array:int      = 9;
		private /* readonly */ AMF3_Object:int     = 10;
		private /* readonly */ AMF3_AvmPlusXml:int = 11;
		private /* readonly */ AMF3_ByteArray:int  = 12;
		
		public data:Uint8Array;
		public dataView:DataView;
		public length:int = 0;
		public position:int = 0;
		public littleEndian:boolean = false;
		public objectEncoding:int = this.ENCODING_AMF3;
		public stringTable:string[] = [];
		public objectTable:Object[] = [];
		public traitTable:Trait[] = [];
		
		/**
		 * Attempt to imitate AS3's ByteArray as very high-performance javascript.
		 * I aliased the functions to have shorter names, like ReadUInt32 as well as ReadUnsignedInt.
		 * I used some code from http://fhtr.blogspot.com/2009/12/3d-models-and-parsing-binary-data-with.html
		 * to kick-start it, but I added optimizations and support both big and little endian.
		 * @param data A Uint8Array
		 */
		constructor(data:Uint8Array, littleEndian:boolean = false)
		{
			var data_any = data || new Uint8Array(data);
			this.data = data_any;
			this.dataView = new DataView(this.data.buffer, this.data.byteOffset, this.data.length);
			this.littleEndian = littleEndian;
			this.length = this.data.length;
	
			this.stringTable = [];
			this.objectTable = [];
			this.traitTable = [];
		}
		
		public readByte():int
		{
			return this.data[this.position++];
		}
	
		public readUnsignedByte():int
		{
			return this.data[this.position++] & 0xFF;
		}
	
		public readBoolean():boolean
		{
			return this.data[this.position++] & 0xFF ? true : false;
		}
	
		private readUInt30():int
		{
			if (this.littleEndian)
				return this.readUInt30LE();
			var ch1:int = this.data[this.position++] & 0xFF;
			var ch2:int = this.data[this.position++] & 0xFF;
			var ch3:int = this.data[this.position++] & 0xFF;
			var ch4:int = this.data[this.position++] & 0xFF;
	
			if (ch1 >= 64)
				return undefined;
	
			return ch4 | (ch3 << 8) | (ch2 << 16) | (ch1 << 24);
		}
	
		public readUnsignedInt/*readUInt32*/():int
		{
			var value:int = this.dataView.getUint32(this.position, this.littleEndian);
			this.position += 4;
			return value;
		}
		
		public readInt/*readInt32*/():int
		{
			var value:int = this.dataView.getInt32(this.position, this.littleEndian);
			this.position += 4;
			return value;
		}
	
		public readUnsignedShort/*readUInt16*/():int
		{
			var value:int = this.dataView.getUint16(this.position, this.littleEndian);
			this.position += 2;
			return value;
		}
		
		public readShort/*readInt16*/():int
		{
			var value:int = this.dataView.getInt16(this.position, this.littleEndian);
			this.position += 2;
			return value;
		}
	
		public readFloat/*readFloat32*/():number
		{
			var value:number = this.dataView.getFloat32(this.position, this.littleEndian);
			this.position += 4;
			return value;
		}
	
		public readDouble/*readFloat64*/():number
		{
			var value:number = this.dataView.getFloat64(this.position, this.littleEndian);
			this.position += 8;
			return value;
		}
	
		private readUInt29():int
		{
			var value:int;
	
			// Each byte must be treated as unsigned
			var b:int = this.data[this.position++] & 0xFF;
	
			if (b < 128)
				return b;
	
			value = (b & 0x7F) << 7;
			b = this.data[this.position++] & 0xFF;
	
			if (b < 128)
				return (value | b);
	
			value = (value | (b & 0x7F)) << 7;
			b = this.data[this.position++] & 0xFF;
	
			if (b < 128)
				return (value | b);
	
			value = (value | (b & 0x7F)) << 8;
			b = this.data[this.position++] & 0xFF;
	
			return (value | b);
		}
	
		private readUInt30LE():int
		{
			var ch1:int = this.data[this.position++] & 0xFF;
			var ch2:int = this.data[this.position++] & 0xFF;
			var ch3:int = this.data[this.position++] & 0xFF;
			var ch4:int = this.data[this.position++] & 0xFF;
	
			if (ch4 >= 64)
				return undefined;
	
			return ch1 | (ch2 << 8) | (ch3 << 16) | (ch4 << 24);
		}
	
		private readDate():Date
		{
			var time_ms:number = this.readDouble();
			var tz_min:int = this.readUnsignedShort();
			return new Date(time_ms + tz_min * 60 * 1000);
		}
	
		public readUTFBytes(len:int):string
		{
			var str:string = new StringView(data, "UTF-8", this.position, len).toString();
			this.position += len;
			return str;
		}
	
		public readUTF():string
		{
			return this.readUTFBytes(this.readUnsignedShort());
		}
	
		public readLongUTF():string
		{
			return this.readUTFBytes(this.readUInt30());
		}
	
		private stringToXML(str:string):XMLDocument
		{
			var xmlDoc:XMLDocument|ActiveXObject;
	
			if (DOMParser)
			{
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(str, "text/xml");
			}
			else // IE
			{
				xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				(xmlDoc as any).async = false;
				(xmlDoc as any).loadXML(str);
			}
	
			return xmlDoc as XMLDocument;
		}
	
		public readXML():XMLDocument
		{
			var xml:string = this.readLongUTF();
	
			return this.stringToXML(xml);
		}
	
		private readStringAMF3():string
		{
			var ref:int = this.readUInt29();
	
			if ((ref & 1) == 0) // This is a reference
				return this.stringTable[(ref >> 1)];
	
			var len:int = (ref >> 1);
	
			if (0 == len)
				return "";
	
			var str:string = this.readUTFBytes(len);
	
			this.stringTable.push(str);
	
			return str;
		}
	
		private readTraits(ref:int):Trait
		{
			var traitInfo:Trait = {};
			traitInfo.properties = [];
	
			if ((ref & 3) == 1)
				return this.traitTable[(ref >> 2)];
	
			traitInfo.externalizable = ((ref & 4) == 4);
	
			traitInfo.dynamic = ((ref & 8) == 8);
	
			traitInfo.count = (ref >> 4);
			traitInfo.className = this.readStringAMF3();
	
			this.traitTable.push(traitInfo);
	
			for (var i:int = 0; i < traitInfo.count; i++)
			{
				var propName:string = this.readStringAMF3();
				traitInfo.properties.push(propName);
			}
	
			return traitInfo;
		}
	
		private readExternalizable(className:string):Object
		{
			return this.readObject();
		}
	
		public readObject():Object
		{
			if (this.objectEncoding == this.ENCODING_AMF0)
			{
				return this.readAMF0Object();
			}
			else if (this.objectEncoding == this.ENCODING_AMF3)
			{
				return this.readAMF3Object();
			}
			return undefined;
		}
	
		private readAMF0Object():Object
		{
			var marker:int = this.data[this.position++] & 0xFF;
			var value:Object, o:any;
	
			if (marker == this.AMF0_Number)
			{
				return this.readDouble();
			}
			else if (marker == this.AMF0_Boolean)
			{
				return this.readBoolean();
			}
			else if (marker == this.AMF0_String)
			{
				return this.readUTF();
			}
			else if ((marker == this.AMF0_Object) || (marker == this.AMF0_ECMAArray))
			{
				o = {};
	
				var ismixed:boolean = (marker == this.AMF0_ECMAArray);
	
				if (ismixed)
					this.readUInt30();
	
				while (true)
				{
					var c1:int = this.data[this.position++] & 0xFF;
					var c2:int = this.data[this.position++] & 0xFF;
					var name:string = this.readUTFBytes((c1 << 8) | c2);
					var k:int = this.data[this.position++] & 0xFF;
					if (k == this.AMF0_ObjectEnd)
						break;
	
					this.position--;
	
					o[name] = this.readObject();
				}
	
				return o;
			}
			else if (marker == this.AMF0_StrictArray)
			{
				var size:int = this.readInt();
	
				var a:Object[] = [];
	
				for (var i:int = 0; i < size; ++i)
				{
					a.push(this.readObject());
				}
	
				return a;
			}
			else if (marker == this.AMF0_TypedObject)
			{
				o = {};
	
				var typeName:string = this.readUTF();
				
				var propertyName:string = this.readUTF();
				var type:int = this.data[this.position++] & 0xFF;
				while (type != this.AMF0_ObjectEnd)
				{
					value = this.readObject();
					(o as any)[propertyName] = value;
	
					propertyName = this.readUTF();
					type = this.data[this.position++] & 0xFF;
				}
	
				return o;
			}
			else if (marker == this.AMF0_AvmPlusObject)
			{
				return this.readAMF3Object();
			}
			else if (marker == this.AMF0_Null)
			{
				return null;
			}
			else if (marker == this.AMF0_Undefined)
			{
				return undefined;
			}
			else if (marker == this.AMF0_Reference)
			{
				var refNum:int = this.readUnsignedShort();
	
				value = this.objectTable[refNum];
	
				return value;
			}
			else if (marker == this.AMF0_Date)
			{
				return this.readDate();
			}
			else if (marker == this.AMF0_LongString)
			{
				return this.readLongUTF();
			}
			else if (marker == this.AMF0_XMLObject)
			{
				return this.readXML();
			}
			return undefined;
		}
	
		private readAMF3Object():Object
		{
			var marker:int = this.data[this.position++] & 0xFF;
			var ref:int, len:int, i:int, value:Object;
	
			if (marker == this.AMF3_Undefined)
			{
				return undefined;
			}
			else if (marker == this.AMF3_Null)
			{
				return null;
			}
			else if (marker == this.AMF3_False)
			{
				return false;
			}
			else if (marker == this.AMF3_True)
			{
				return true;
			}
			else if (marker == this.AMF3_Integer)
			{
				// Uses the U29 encoding scheme, though the value is sign extended.
				var int29:int = this.readUInt29();
				if (int29 >= 0x10000000) // largest possible integer is (2^28 - 1)
					int29 -= 0x20000000; // subtract 2^29 to get negative integer
				return int29;
			}
			else if (marker == this.AMF3_Double)
			{
				return this.readDouble();
			}
			else if (marker == this.AMF3_String)
			{
				return this.readStringAMF3();
			}
			else if (marker == this.AMF3_XML)
			{
				return this.readXML();
			}
			else if (marker == this.AMF3_Date)
			{
				ref = this.readUInt29();
	
				if ((ref & 1) == 0)
					return this.objectTable[(ref >> 1)];
	
				var d:number = this.readDouble();
				value = new Date(d);
				this.objectTable.push(value);
	
				return value;
			}
			else if (marker == this.AMF3_Array)
			{
				ref = this.readUInt29();
	
				if ((ref & 1) == 0)
					return this.objectTable[(ref >> 1)];
	
				len = (ref >> 1);
	
				var key:string = this.readStringAMF3();
	
				if (key == "")
				{
					var a:Object[] = [];
	
					for (i = 0; i < len; i++)
					{
						value = this.readObject();
	
						a.push(value);
					}
	
					return a;
				}
	
				// mixed array
				var result:{[key:string]:any} = {};
	
				while (key != "")
				{
					result[key] = this.readObject();
					key = this.readStringAMF3();
				}
	
				for (i = 0; i < len; i++)
				{
					result[i] = this.readObject();
				}
	
				return result;
			}
			else if (marker == this.AMF3_Object)
			{
				var o:Object = {};
	
				this.objectTable.push(o);
	
				ref = this.readUInt29();
	
				if ((ref & 1) == 0)
					return this.objectTable[(ref >> 1)];
	
				var ti:Trait = this.readTraits(ref);
				var className:string= ti.className;
				var externalizable:boolean = ti.externalizable;
	
				if (externalizable)
				{
					o = this.readExternalizable(className);
				}
				else
				{
					len = ti.properties.length;
	
					for (i = 0; i < len; i++)
					{
						var propName:string = ti.properties[i];
	
						value = this.readObject();
	
						(o as any)[propName] = value;
					}
	
					if (ti.dynamic)
					{
						for (; ;)
						{
							var name:string = this.readStringAMF3();
							if (name == null || name.length == 0) break;
	
							value = this.readObject();
							(o as any)[name] = value;
						}
					}
				}
	
				return o;
			}
			else if (marker == this.AMF3_AvmPlusXml)
			{
				ref = this.readUInt29();
	
				if ((ref & 1) == 0)
					return this.stringToXML(this.objectTable[(ref >> 1)] as string);
	
				len = (ref >> 1);
	
				if (0 == len)
					return null;
	
	
				var str:string = this.readUTFBytes(len);
	
				var xml = this.stringToXML(str);
	
				this.objectTable.push(xml);
	
				return xml;
			}
			else if (marker == this.AMF3_ByteArray)
			{
				ref = this.readUInt29();
				if ((ref & 1) == 0)
					return this.objectTable[(ref >> 1)];
	
				len = (ref >> 1);
				
				var ba:JSByteArray = new JSByteArray(this.data.subarray(this.position, this.position += len));
				
				this.objectTable.push(ba);
				
				return ba;
			}
			
			return undefined;
		}
	}
}
