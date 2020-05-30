var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    flash      = require("connect-flash"),
    mongoose   = require("mongoose"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"),
    User       = require("./models/user")

mongoose.connect("mongodb://localhost/beb");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(flash());

//passport_config
app.use(require("express-session")({
    secret:"This Is the secrt page",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.get("/",function(req,res){
    res.render("landing");
})

app.get("/index",function(req,res){
    res.render("index");
})

//auth_routes
app.get("/register",function(req,res){
    res.render("register");
});

//handle signup logic
app.post("/register",function(req,res){
    var newUser = new User({username: req.body.username, emailid: req.body.emailid, phoneno: req.body.phoneno});
    User.register(newUser, req.body.password,function(err,user){
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome to beb "+user.username+ "!")
            res.redirect("/index");
        });
    });
});

//show login form
app.get("/login",function(req,res){
    res.render("login");
});

//login logic
app.post("/login", passport.authenticate("local",
    {
        successRedirect:"/index",
        failureRedirect:"/login"
    }) ,function(req,res){
});

//logout route
app.get("/logout",function(req,res){
    req.logOut();
    req.flash("success","Logged You Out Successfully!")
    res.redirect("/index");
});

//paybill
app.get("/paybill",isLoggedIn,function(req,res){
    res.render("paybill",{cu:req.user});
});

//viewbill
app.get("/viewbill",isLoggedIn,function(req,res){
    res.render("viewbill",{cu:req.user});
});

//footer
app.get("/privacy",function(req,res){
    res.render("privacy");
});
app.get("/dis",function(req,res){
    res.render("dis");
});
app.get("/contact",function(req,res){
    res.render("contact");
});
app.get("/feedback",isLoggedIn,function(req,res){
    res.render("feedback",{cu:req.user});
});

//admin
app.get("/viewuser",isLoggedIn,function(req,res){
    User.find({},function(err,alluser){
        if(err){
            console.log(err);
        }else{
            res.render("viewuser",{curuser:alluser});
        }
    });
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Please Login First!")
    res.redirect("/login");
}

app.listen(3050,function(){
    console.log("Server started....");
});
