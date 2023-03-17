import express, { response } from 'express';

import  { v4 as uuidv4 } from "uuid"

const app = express();

app.use(express.json())

const customers = []

const verifyIfExistsCpfAccount = (req, res, next) =>{

   const {cpf } = req.headers

   const customerFoundByCpf = customers.some(   (customer) => customer.cpf === cpf)

   if(!customerFoundByCpf){
      return res.status(400).json({
         error : "Customer not Found"
      })
   }

   req.customer = customerFoundByCpf
   return next()

}


app.post("/account", (req,res)=>{
   const {cpf, name }= req.headers
   
   const customerAlreadyExists = customers.some(customer => customer.cpf == cpf)

   if(customerAlreadyExists){
      return res.status(400).json({
         error : "User already exists"
      })
   }


   customers.push({
      cpf,
      name,
      id : uuidv4(),
      statement : []
   })

   return res.status(201).json({
      msg : "User created",
      UserInfo : { cpf, name }
      }
         
   )
})

app.use(verifyIfExistsCpfAccount)

app.get("/statement" , verifyIfExistsCpfAccount , (req, res)=>{
   const {customer} = req
   return res.json({
      info : customer.statement
      })
})




app.listen(3333)