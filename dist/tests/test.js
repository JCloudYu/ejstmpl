"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EJSTmpl = require("../ejstmpl.js");
EJSTmpl.search_root = __dirname + "/tmpl";
var b = EJSTmpl.init('/b/b.html');
var tmpl = EJSTmpl.init('/a.html');
console.log(tmpl.render({ view: b.prepare({ MSG: "HI" }) }), "\n");
EJSTmpl.release();
