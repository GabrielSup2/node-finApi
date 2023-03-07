import express, { response } from 'express';

import  { v4 as uuidv4 } from "uuid"

const app = express();

app.use(express.json())

const customers = []

app.post("/account", (req,res)=>{
   const {cpf, name }= req.body
   

const customerAlreadyExists = customers.some(
      (customer) => customer.cpf === cpf)
   
if(customerAlreadyExists){
      return res.status(404).json({
      error : "Customer already exists"
   })
}

customers.push({
      cpf,
      name,
      id : uuidv4(),
      statement : []
   })

   return res.status(201).send(customers)
})

app.listen(3333)