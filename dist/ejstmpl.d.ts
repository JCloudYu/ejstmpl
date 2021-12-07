import ejs = require('ejs');
declare class RenderUnit {
    constructor(renderer: ejs.TemplateFunction, params: AnyObject);
    render(): string;
    toString(): string;
}
interface _EJSTmplGlobals {
    [key: string]: any;
}
declare global {
    interface EJSTmplGlobals extends _EJSTmplGlobals {
    }
}
declare class EJSTmpl {
    static get search_root(): string;
    static set search_root(v: string);
    static get globals(): EJSTmplGlobals;
    static init(file_name: string): EJSTmpl;
    static release(): void;
    constructor(file_name: string);
    get file_path(): string;
    release(): void;
    render(params: AnyObject): string;
    prepare(params: AnyObject): RenderUnit;
}
export = EJSTmpl;
declare type AnyObject = {
    [key: string]: any;
};
