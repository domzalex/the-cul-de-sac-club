const express = require("express");
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

//models
const BlogEntry = require('./models/BlogEntry');
const User = require('./models/user');

//takes care of dotenv
dotenv.config();

//allows css to be linked in html
app.use('/static', express.static('static'));
app.use(express.urlencoded({ extended: true }));


//db connection
mongoose.set('useNewUrlParser', true);  
mongoose.set('useCreateIndex', true); 
mongoose.set('useUnifiedTopology', true); 
mongoose.set('useFindAndModify', false);

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => {
    console.log('DB connected.');
    //init server
    app.listen(3000, () => console.log('Server running.'));
});


//engine config (ejs as templates)
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({ 
    secret: "Super epic secret", 
    resave: false, 
    saveUninitialized: false
})); 

app.use(passport.initialize()); 
app.use(passport.session()); 
  
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 


//////////////////////////////////////
// GET METHODS                     
//////////////////////////////////////

//gets homepage

var toggleSort = 1;
app.get('/', (req, res) => {
    if (toggleSort == 0) {
        BlogEntry.find({}, (err, entries) => {
            res.render('home.ejs', { blogEntry: entries });
        });
    } else if (toggleSort == 1) {
        BlogEntry.find({}, (err, entries) => {
            res.render('home.ejs', { blogEntry: entries });
        }).sort({_id: -1});
    }
    
});

//gets user registration
app.get('/register', (req, res) => {
    res.render('register.ejs');
})

//gets login/logout
app.get('/login', (req, res) => {
    res.render('login.ejs'); 
});
app.get("/logout", (req, res) => { 
    req.logout(); 
    res.redirect("/"); 
}); 
app.get('/userProfile', isLoggedIn, (req, res) => {
    var user = req.user;
    BlogEntry.find({}, (err, entries) => {
        res.render('userProfile.ejs', { blogEntry: entries, user: user });
    }).sort({_id: -1});
});
app.get("/otherStuff", (req, res) => { 
    res.render('otherStuff.ejs');
}); 

//gets blogEntryPage
app.get('/createBlogEntry', isLoggedIn, (req, res) => {
    var user = req.user;
    res.render('createBlog.ejs');
});



//////////////////////////////////////
// POST METHODS                     
//////////////////////////////////////

//posts registration 
app.post("/register", (req, res) => { 
    var username = req.body.username 
    var password = req.body.password 
    User.register(new User({ username: username }), 
            password, (err, user) => { 
        if (err) { 
            console.log(err); 
            return res.render("register.ejs"); 
        } 
        passport.authenticate("local")( 
            req, res, () => { 
            res.redirect("/"); 
        });
    }); 
}); 

//posts login
app.post("/login", passport.authenticate("local", { 
    successRedirect: "/userProfile", 
    failureRedirect: "/login"
}), (req, res) => { 
}); 

//posts home (to get user profile page from entry)
app.post("/", (req, res) => { 
    const user = req.body.username;
    BlogEntry.find({}, (err, entries) => {
        res.render('profile.ejs', { blogEntry: entries, req: req, name: user });
    }).sort({_id: -1});
}); 

//posts toggleSort
app.post('/toggleSort', (req, res) => {
    if (toggleSort == 1) {
        toggleSort = 0;
    } else if (toggleSort == 0) {
        toggleSort = 1;
    };
    res.redirect('/');
});

//posts blogEntry
app.post('/createBlogEntry', async (req, res) => {
    var user = req.user;
    const blogEntry = new BlogEntry({
        name: user.username,
        title: req.body.title,
        content: req.body.content
    });
    try {
        await blogEntry.save();
        res.redirect('/userProfile');
    } catch (err) {
        res.redirect('/userProfile')
    }
});

/////////////////////////////////
// DELETE POST
/////////////////////////////////
app.route("/remove/:id").get((req, res) => {
    const id = req.params.id;
    BlogEntry.findByIdAndRemove(id, err => {
        if (err) return res.send(500, err);
        res.redirect("/userProfile");
    });
});

//checks logged in
function isLoggedIn(req, res, next) { 
    if (req.isAuthenticated()) return next(); 
    res.redirect("/login"); 
} 


