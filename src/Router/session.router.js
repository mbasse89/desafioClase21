import { Router } from "express"
import passport from "passport"

const router = Router()

router.post("/login", passport.authenticate("login", { failureRedirect: "/" }), async (req, res) => {
  try {
    if (!req.user) return res.status(400).send("Invalid credentials")
    req.session.user = req.user
    return res.redirect("/products")
  } catch (e) {
    console.log("Error:", e)
    return res.status(500).send({ message: "Server Error" })
  }
})

router.post("/register", passport.authenticate("register", {failureRedirect: "/"}), async (req, res) => {
  try {
    res.send({ url: "login" })
  }
  catch (e) {
    console.log("Error:", e)
    return res.status(500).send({ message: "Server Error" })
  }
})

router.get("/github", passport.authenticate("github", {scope: ['user:email']}), async (req,res) => {})

router.get("/githubcallback", passport.authenticate("github", {failureRedirect: "/"}), async (req,res) => {
  try {
    req.session.user = req.user
    res.redirect("/products")
  }
  catch (e) {
    console.log("Error:", e)
    return res.status(500).send({ message: "Server Error" })
  }
})

router.get("/logout", (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) return res.status(500).send({ message: "Logout error" })
      return res.redirect("/login")
    })
  }
  catch (e) {
    console.log("Error:", e)
    return res.status(500).send({ message: "Server Error" })
  }
})

export default router