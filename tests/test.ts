import EJSTmpl = require('../ejstmpl.js');
EJSTmpl.search_root = `${__dirname}/tmpl`;


declare global {
	interface EJSTmplGlobals { MSG:string; SUBMSG:string; }
}

EJSTmpl.globals.MSG = 'MSG_Content';
EJSTmpl.globals.SUBMSG = 'SUBMSG_Content';
const b = EJSTmpl.init('/b/b.html');
const tmpl = EJSTmpl.init('/a.html');
console.log(tmpl.render({view:b.prepare({MSG:"HI"})}), "\n");


EJSTmpl.release();