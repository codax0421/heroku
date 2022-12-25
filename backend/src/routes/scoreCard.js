import express, { Router } from "express";
import { ObjectId } from "mongoose";
import ScoreCard from "../models/ScoreCard.js"

const router = Router();
router.use(express.json())
const saveScore = async (name, subject ,score) => {
    const existing = await ScoreCard.findOne({Name:name,Subject:subject});
    if (existing){
        ScoreCard.updateOne({ Name:name,Subject:subject},{$set:{Score:score}})
        return("update")
    }
    try {
    const newScoreCard = new ScoreCard({ Name:name,Subject:subject ,Score:score});
    // console.log("Created user", newScoreCard);
    newScoreCard.save();
    return ("add")
    } catch (e) { throw new Error(false); }
   };

   const deleteDB = async () => {
    try {
    await ScoreCard.deleteMany({});
    console.log("Database deleted");
    } catch (e) { throw new Error("Database deletion failed"); }
   };

router.delete("/cards",(req,res)=>{
    deleteDB();
    res.json({ message: 'Database cleared' })
}) ;


router.post("/card", (req,res)=>{
  
    let name =req.body.name;
    let subject = req.body.subject;
    let score = req.body.score;
    saveScore(name,subject,score)
    .then(result =>{
        console.log(result)
        if(result =="add")
        {
            res.json({card:`Adding(${name},${subject},${score})`,message:`Adding(${name},${subject},${score})`})
        }
        else if(result == "update")
        {
            res.json({card:`Updating(${name},${subject},${score})`,message:`Updating(${name},${subject},${score})`})
        }
        else{
            res.json({message:"error"})
        }
       
    })
   
    
});


router.get("/cards",(req,res)=>{
   
    let query = req.query.queryString
    let queryType =req.query.type
    console.log(queryType)

    if(queryType== "name")
    {
        ScoreCard.find({Name:query})
        .then(result=>{
            // console.log(result[0].Name)
            let dataLength = result.length;
           
            var data =[] ;
            console.log(result)
            for(let i= 0 ;i<=dataLength ;i++)
            {
                   if(i == 0)
                   {
                    data[i]=`Found card with ${queryType} :`
                   } 
                   else{

                  
                    data[i]=`(${result[i-1].Name},${result[i-1].Subject},${result[i-1].Score})`
                   }
            }
           
            let response = data
            // console.log("funny" ,funny)
            // console.log("data" ,data)

            if(data.length == 1)
            {
                res.json({messages:false,
                message:`${queryType}(${query}) not found!`})

            }
            else
            {
                res.json({messages:data})
            }
       
        })
       
    }
    else{
        ScoreCard.find({Subject:query})
        .then(result=>{
        
            let dataLength = result.length;
           
            var data =[] ;
          
            for(let i= 0 ;i<=dataLength ;i++)
            {
                if(i == 0)
                {
                 data[i]=`Found card with ${queryType} :`
                } 
                else{

               
                 data[i]=`(${result[i-1].Name},${result[i-1].Subject},${result[i-1].Score})`
                }
                
            }
          
            let response = data
            // console.log("funny" ,funny)
            // console.log("data" ,data)
            
            if(data.length == 1)
            {
                res.json({messages:false,
                message:`${queryType}(${query}) not found!`})

            }
            else
            {
                res.json({messages:data})
            }
       
        })
    
    }
    
    
});
export default router;