const express = require('express');
const hbs = require('hbs');

var app = express();

hbs.registerPartials(__dirname +'/views/partials');
app.set('view-engine', 'hbs');
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) =>{
    var now = new Date().toString();
    console.log(`${now}: ${req.method} `);
    next();
});


hbs.registerHelper('getCurrentYear', () =>{
    return new Date().getFullYear()
});

hbs.registerHelper('screamIt', (text) =>{
    return text.toUpperCase()
});

app.get('/', (req, res) => {
   //res.send('<h1>hello</h1>');
    res.send({
        name: 'Gergely',
        likes: 'node.js'
    });
});


app.get('/about', (req, res) => {
    res.render('about.hbs', {
        pageTitle: 'About Page',
        currentYear: new Date().getFullYear()
    });
});

app.listen(3000, ()=>{
    console.log('Server is up');
});
