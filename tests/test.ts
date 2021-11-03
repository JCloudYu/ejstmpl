import EJSTmpl = require('../ejstmpl.js');
EJSTmpl.search_root = `${__dirname}/tmpl`;


const b = EJSTmpl.init('/b/b.html');
const tmpl = EJSTmpl.init('/a.html');
console.log(tmpl.render({view:b.prepare({MSG:"HI"})}), "\n");


EJSTmpl.release();