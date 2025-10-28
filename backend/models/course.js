import mongoose from "mongoose";

// course schema
const userSchema = new mongoose.Schema({
    title:String,
    description:String,
    duration:Number,
    students:String,
    progress:Map,
    quiz:Object
})
//model
const User = mongoose.model('User',userSchema);

export default User;