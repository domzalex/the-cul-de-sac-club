const express = require("express");
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//models
const BlogEntry = require('./models/BlogEntry');



dotenv.config();

//allows css to be linked in html
app.use('/static', express.static('static'));

app.use(express.urlencoded({ extended: true }));

//db connection
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => {
    console.log('DB connected.');
    //init server
    app.listen(3000, () => console.log('Server running.'));
});


//engine config (ejs as templates)
app.set('view engine', 'ejs');




//////////////////////////////////////
// GET METHODS                     
//////////////////////////////////////

//gets homepage
app.get('/', (req, res) => {
    BlogEntry.find({}, (err, entries) => {
        res.render('home.ejs', { blogEntry: entries });
    });
});

//gets login
app.get('/login', (req, res) => {
    res.render('login.ejs'); 
});

//gets blogEntryPage
app.get('/createBlogEntry', (req, res) => {
    res.render('createBlog.ejs');
});



//////////////////////////////////////
// POST METHODS                     
//////////////////////////////////////

//posts blogEntry
app.post('/createBlogEntry', async (req, res) => {
    const blogEntry = new BlogEntry({
        name: req.body.name,
        title: req.body.title,
        content: req.body.content
    });
    try {
        await blogEntry.save();
        res.redirect('/');
    } catch (err) {
        res.redirect('/')
    }
});