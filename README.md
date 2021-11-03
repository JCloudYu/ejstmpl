# EJS Template Engine #
```javascript
const EJSTmpl = require('ejstmpl');

// Define template search root
EJSTmpl.search_root = `${__dirname}/tmpl`;


// Init templates
const b = EJSTmpl.init('/b/b.html');
const tmpl = EJSTmpl.init('/a.html');

// Render template
console.log(tmpl.render({view:b.prepare({MSG:"HI"})}), "\n");

// Release all caches
EJSTmpl.release();
```