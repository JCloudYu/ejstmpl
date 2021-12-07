"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var path = require("path");
var fs = require("fs");
var ejs = require("ejs");
var Runtime = { search_root: '', globals: {} };
var RenderUnitPrivates = new WeakMap();
var EJSTmplPrivates = new WeakMap();
var RenderUnit = /** @class */ (function () {
    function RenderUnit(renderer, params) {
        RenderUnitPrivates.set(this, { cache: renderer, params: params });
    }
    RenderUnit.prototype.render = function () {
        var privates = RenderUnitPrivates.get(this);
        return privates.cache(privates.params);
    };
    RenderUnit.prototype.toString = function () { return this.render(); };
    return RenderUnit;
}());
var FileCache = /** @class */ (function () {
    function FileCache() {
    }
    FileCache.set = function (key, val) {
        var _this = this;
        var cache = this._file_watch.get(key);
        if (cache && cache.template)
            return;
        if (!cache) {
            var file_watcher_1 = fs.watch(key, function (e, f) {
                var cache = _this._file_watch.get(key);
                if (!cache)
                    file_watcher_1.close();
                cache.template = undefined;
                if (e === 'rename') {
                    file_watcher_1.close();
                    _this._file_watch.delete(key);
                }
            });
            cache = { watcher: file_watcher_1, template: undefined };
            this._file_watch.set(key, cache);
        }
        cache.template = val;
    };
    FileCache.get = function (key) {
        var cache = this._file_watch.get(key);
        return cache ? cache.template : undefined;
    };
    FileCache.delete = function (key) {
        var cache = this._file_watch.get(key);
        if (!cache)
            return;
        this._file_watch.delete(key);
        cache.watcher.close();
    };
    FileCache.reset = function () {
        var e_1, _a;
        var entries = this._file_watch.entries();
        try {
            for (var entries_1 = __values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                var _b = __read(entries_1_1.value, 2), key = _b[0], watcher = _b[1].watcher;
                watcher.close();
                this._file_watch.delete(key);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    FileCache._file_watch = new Map();
    return FileCache;
}());
;
ejs.cache = FileCache;
var EJSTmpl = /** @class */ (function () {
    function EJSTmpl(file_name) {
        if (file_name[0] === '/')
            file_name = '.' + file_name;
        EJSTmplPrivates.set(this, {
            file_name: file_name,
            file_root: Runtime.search_root,
            file_path: path.resolve(Runtime.search_root, file_name)
        });
        EJSTplGetCache.call(this);
    }
    Object.defineProperty(EJSTmpl, "search_root", {
        get: function () { return Runtime.search_root; },
        set: function (v) { Runtime.search_root = '' + v; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EJSTmpl, "globals", {
        get: function () { return Runtime.globals; },
        enumerable: false,
        configurable: true
    });
    EJSTmpl.init = function (file_name) { return new EJSTmpl(file_name); };
    EJSTmpl.release = function () { FileCache.reset(); };
    Object.defineProperty(EJSTmpl.prototype, "file_path", {
        get: function () { return EJSTmplPrivates.get(this).file_path; },
        enumerable: false,
        configurable: true
    });
    EJSTmpl.prototype.release = function () {
        FileCache.delete(EJSTmplPrivates.get(this).file_path);
    };
    EJSTmpl.prototype.render = function (params) {
        return EJSTplGetCache.call(this)(__assign(__assign({}, Runtime.globals), params));
    };
    EJSTmpl.prototype.prepare = function (params) {
        return new RenderUnit(EJSTplGetCache.call(this), __assign(__assign({}, Runtime.globals), params));
    };
    return EJSTmpl;
}());
function EJSTplGetCache() {
    var _a = EJSTmplPrivates.get(this), file_path = _a.file_path, file_root = _a.file_root;
    var cache = FileCache.get(file_path);
    if (cache)
        return cache;
    cache = ejs.compile(fs.readFileSync(file_path).toString('utf8'), { cache: true, filename: file_path, root: file_root });
    FileCache.set(file_path, cache);
    return cache;
}
{
    var candidate = require.main ? require.main.path : __dirname, found = false;
    while (true) {
        try {
            var state = fs.statSync(candidate + "/node_modules");
            if (state.isDirectory()) {
                found = true;
                break;
            }
        }
        catch (e) { }
        if (!found) {
            var prev = path.dirname(candidate);
            if (prev === '.' || prev === candidate)
                break;
            candidate = prev;
        }
    }
    if (found) {
        EJSTmpl.search_root = candidate;
    }
    else {
        EJSTmpl.search_root = require.main ? require.main.path : process.cwd();
    }
}
module.exports = EJSTmpl;
