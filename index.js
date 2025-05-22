const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Ejienry = express();

Ejienry.use(express.json())

const PORT = process.env.PORT || 1007;


mongoose.connect(process.env.MONGODB_URL)
.then (() => {
    console.log("Ejienry Nigeria Limited")

    Ejienry.listen(PORT, () => {console.log(
    `Ejienry ${PORT}`);
});
})

// API for sign up
Ejienry.post("/sign-up", async (req, res) => {

    const {emai, password, firstName, lastName} = req.body
    if(!email){
        return res.status(400).json({message: "Email is required"})
    }

    if(!password){
        return res.status(400).json({message: "Password is required"})
    }

    const existingUser = await Auth
})