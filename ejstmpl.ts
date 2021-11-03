import path = require('path');
import fs = require('fs');
import ejs = require('ejs');

const Runtime = { search_root:'' };
const RenderUnitPrivates = new WeakMap<RenderUnit, RenderUnitPrivate>();
const EJSTmplPrivates = new WeakMap<EJSTmpl, EJSTmplPrivate>();
class RenderUnit {
	constructor(renderer:ejs.TemplateFunction, params:AnyObject) {
		RenderUnitPrivates.set(this, {cache:renderer, params});
	}
	render() {
		const privates = RenderUnitPrivates.get(this)!;
		return privates.cache(privates.params);
	}
	toString() { return this.render(); }
}

class FileCache {
	static _file_watch:Map<string, {watcher:fs.FSWatcher, template?:ejs.TemplateFunction}> = new Map();
	static set(key:string, val:ejs.TemplateFunction) {
		let cache = this._file_watch.get(key);
		if ( cache && cache.template ) return;


		if ( !cache ) {
			const file_watcher = fs.watch(key, (e, f)=>{
				const cache = this._file_watch.get(key);
				if (!cache) file_watcher.close();

				cache!.template = undefined;
				if ( e === 'rename' ) {
					file_watcher.close();
					this._file_watch.delete(key);
				}
			});

			cache = { watcher:file_watcher, template:undefined };
			this._file_watch.set(key, cache);
		}

		cache.template = val;
	}
	static get(key:string):ejs.TemplateFunction|undefined {
		const cache = this._file_watch.get(key);
		return cache ? cache.template : undefined;
	}
	static delete(key:string) {
		const cache = this._file_watch.get(key);
		if ( !cache ) return;

		this._file_watch.delete(key);
		cache.watcher.close();
	}
	static reset() {
		const entries = this._file_watch.entries();
		for(const [key, {watcher}] of entries) {
			watcher.close();
			this._file_watch.delete(key);
		}
	}
};
ejs.cache = FileCache;

class EJSTmpl {
	static get search_root():string { return Runtime.search_root; }
	static set search_root(v:string) { Runtime.search_root = '' + v; }
	static init(file_name:string):EJSTmpl { return new EJSTmpl(file_name); }
	static release() { FileCache.reset(); }
	
	constructor(file_name:string) {
		if ( file_name[0] === '/' ) file_name = '.' + file_name;

		EJSTmplPrivates.set(this, {
			file_name, 
			file_root:Runtime.search_root, 
			file_path:path.resolve(Runtime.search_root, file_name)
		});

		EJSTplGetCache.call(this);
	}
	
	get file_path():string { return EJSTmplPrivates.get(this)!.file_path; }

	release() {
		FileCache.delete(EJSTmplPrivates.get(this)!.file_path)
	}

	render(params:AnyObject) {
		return EJSTplGetCache.call(this)(params);
	}
	
	prepare(params:AnyObject) {
		return new RenderUnit(EJSTplGetCache.call(this), params);
	}
}
function EJSTplGetCache(this:EJSTmpl):ejs.TemplateFunction {
	const {file_path, file_root} = EJSTmplPrivates.get(this)!;
	let cache = FileCache.get(file_path)
	if ( cache ) return cache;

	cache = ejs.compile(fs.readFileSync(file_path).toString('utf8'), {cache:true, filename:file_path, root:file_root});
	FileCache.set(file_path, cache);
	return cache;
}
export = EJSTmpl;




{
	let candidate = require.main ? require.main.path : __dirname, found = false;
	while(true) {
		try {
			let state = fs.statSync(`${candidate}/node_modules`);
			if ( state.isDirectory() ) { found = true; break; }
		} catch(e) {}

		if ( !found ) {
			const prev = path.dirname(candidate);
			if ( prev === '.' || prev === candidate ) break;
			candidate = prev;
		}
	}

	if ( found ) {
		EJSTmpl.search_root = candidate;
	}
	else {
		EJSTmpl.search_root = require.main?require.main.path:process.cwd();
	}
}






type AnyObject = {[key:string]:any};
type RenderUnitPrivate = {cache:ejs.TemplateFunction, params:AnyObject};
type EJSTmplPrivate = {file_name:string, file_root:string, file_path:string};