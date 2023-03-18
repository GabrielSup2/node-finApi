import express, { response } from 'express';

import  { v4 as uuidv4 } from "uuid"

const app = express();

app.use(express.json())

const customers = []

//const findCostumer = (costumer) =>{customers.find(customer =>{  customer.cpf == costumer.cpf})}

const verifyIfExistsCpfAccount = (req, res, next) =>{

   const {cpf} = req.headers

   const customerFoundByCpf = customers.find( (customer) => {
      return  customer.cpf == cpf;
   })
   

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

 

   res.status(201).json({
      msg : "User created",
      UserInfo : { cpf, name }
      }
         
   )
})

app.get("/statement"  , verifyIfExistsCpfAccount, (req, res)=>{
   const {customer} = req
   const balance = getBalance(customer.statement)
   return res.json({
      info : customer.statement,
      balance
      })
})

app.post("/deposit", verifyIfExistsCpfAccount, (req, res )=>{
   
   const {description , amount} = req.body
   const {customer} = req
   const operationInfo = {
      description,
      amount,
      type : "credit",
      create_at : new Date()
   }
   
   customer.statement.push(operationInfo)

   return res.status(201).send("Deposit created!")


} )

function getBalance(statement){
   const balance = statement.reduce((acc, operation)=>{
      if(operation.type == "credit"){
         return acc + operation.amount
      }
      return acc - operation.amount
   }, 0)

   return balance
}

app.post("/withdraw",verifyIfExistsCpfAccount , (req,res)=>{
      const {widrawAmount } = req.body
      const {customer } = req
      const balance = getBalance(customer.statement)
      const thereISNoFundsAvailable = widrawAmount > balance

      if(thereISNoFundsAvailable){
         return res.status(400).json({
            error : "There is no funds available into your account"
         })
      }

      const operationInfo = {
         amount :widrawAmount,
         type : "debit",
         create_at : new Date()
      }

      customer.statement.push(operationInfo)

      return res.status(200).send("withdraw was sucessful")

}
)

app.get("/statement/date"  , verifyIfExistsCpfAccount, (req, res)=>{
   const {customer} = req
  const {date} = req.query
   
  const dateFormat = new Date(date + " 00:00")

  const statement = customer.statement.filter((statement)=> statement.create_at.toDateString() ===
    new Date(dateFormat).toDateString()
    )

    return res.json(statement)
});

app.put("/account", verifyIfExistsCpfAccount, (req, res)=>{
   const {customer} = req
   const {newName} = req.body

   customer.name = newName

   return res.status(200).json({
      msg :"The info was updated succesfully" ,
      customerInfo : customer
   })
})

app.get("/account", verifyIfExistsCpfAccount, (req, res)=>{
   const {customer} = req
   const balance = getBalance(customer.statement)

   return res.status(200).json({
       customer,
       balance
   })
})

app.delete("/account", verifyIfExistsCpfAccount, (req, res)=>{
   const { customer} = req
   customers.splice(customer,1)

   res.status(200).json(customers)
})




app.listen(3333)