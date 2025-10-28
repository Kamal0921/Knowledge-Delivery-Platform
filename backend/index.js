const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());


mongoose.connect('mongodb+srv://Kamal:Kamal2006@cluster0.aoshqsw.mongodb.net/Course?retryWrites=true&w=majority&appName=Cluster0')
.then(()=>console.log("Connected to MongoDB"))
.catch((err)=>console.log(err));


//routing
app.post('/courses',() => {
    res.send("welcome to portal");
})
app.listen(3000,()=>{
    console.log("port is listening");
})

