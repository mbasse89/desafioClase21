import { Router } from "express"
import UserModel from "../DAO/models/user.models.js"

const router = Router()

router.post("/login", async (req,res) => {
  try {
    const {email, password} = req.body
    const user = await UserModel.findOne({email, password})
  
    if (!user) return res.status(400).redirect("/login")
  
    req.session.user = user
    return res.redirect("/login")
  } catch(e) {
    console.log("Error:",e)
    return res.status(500).send({message: "Server Error"})
  }
}) 

router.post("/register", async (req,res) => {
  try {
    await UserModel.create(req.body)
    return res.send({url:"login"})
  }
  catch(e) {
    console.log("Error:",e)
    return res.status(500).send({message: "Server Error"})
  }
})

router.get("/logout", (req,res) => {
  try {
    req.session.destroy(err => {
      if (err) return res.status(500).send({message: "Logout error"})
      return res.redirect("/login")
    })
  }
  catch(e) {
    console.log("Error:",e)
    return res.status(500).send({message: "Server Error"})
  }
})

export default router