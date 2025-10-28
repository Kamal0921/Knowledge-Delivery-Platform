import Course from '../models/course';

export const getCourse = async(req,res)=>{
    try{
        const courses = await Course.find();
        return res.join(courses);
    }catch(err){
        return res.status(500).json({message:"There is an error"})
    }
}
