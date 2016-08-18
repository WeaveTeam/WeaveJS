declare module "proj4" {
    export = proj4;
}
declare type Proj4 = typeof proj4;

declare module proj4 {
    export class Proj {
        constructor(srs: string);
    }

    export class Point {
        x: number;
        y: number;
        constructor(x: number, y: number);
    }

    export function transform(from: any, to: any, pt: Point): Point;
    export function parse(sr: string): any;

    //defs('EPSG:3857', "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");
    export function defs(name: string): any;
    export function defs(name: string, def: string): void;
}
