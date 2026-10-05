const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");


const listings = require("./routes/listings.js");
const reviews = require("./routes/review.js");

const Mongo_Url = "mongodb://127.0.0.1:27017/wanderlust";
async function main() {
    await mongoose.connect(Mongo_Url);
}

main()
  .then(() =>{
    console.log("connected sucessfully");
}).catch((err) => {
    console.log(err);
});

app.set("view engine" , "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended :true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret: "mysecretcode",
    resave:false,
    saveinitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        MaxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
};



app.get("/", (req,res) => {
    res.send("HI, I am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next) => {
    res.locals.success = req.flash("sucess");
    next();
})

app.use("/listings", listings);
app.use("/listings/:id/reviews" , reviews);


app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next)=> {
    let {statusCode = 500, message="Something went Wrong!"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, () => {
    console.log("server is listening on port 8080");
});

