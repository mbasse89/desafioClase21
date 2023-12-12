import passport from "passport"
import local from "passport-local"
import GithubStrategy from "passport-github2"
import UserModel from "../DAO/models/user.models.js"
import { isValidPassword, createHash } from "../utils.js"

const LocalStrategy = local.Strategy

const initializePassport = () => {

  passport.use("register", new LocalStrategy({
    passReqToCallback: true,
    usernameField: "email"
  }, async (req, username, password, done) => {
    const { first_name, last_name, email, age, role } = req.body
    try {
      const user = await UserModel.findOne({ email: username })
      if (user) {
        console.log("User already exists")
        return done(null, false)
      }

      const newUser = {
        first_name,
        last_name,
        email,
        age,
        role,
        password: createHash(password)
      }

      const result = await UserModel.create(newUser)
      return done(null, result)
    }
    catch (e) {
      return done("Error: " + e)
    }
  }))

  passport.use("login", new LocalStrategy({
    usernameField: "email"
  }, async (username, password, done) => {
    try {
      const user = await UserModel.findOne({email: username}).lean().exec()

      if (!user) {
        console.log("User doesn't exists")
        return done(null, false)
      }

      if (!isValidPassword(user, password)) {
        console.log("Incorrect password")
        return done(null, false)
      }

      return done(null, user)
    }
    catch(e) {
      return done("Error: "+e)
    }
  }))

  passport.use("github", new GithubStrategy({
    clientID: "Iv1.920884a55092deb0",
    clientSecret: " a94ad48a2bde6e32bc01d05c05d7b49e4cef5459",
    callbackURL: "http://127.0.0.1:8080/api/session/githubcallback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await UserModel.findOne({email: profile._json.email})
      if (user) {
        console.log("User has already registered")
        return done(null, user)
      }

      const newUser = await UserModel.create({
        first_name: profile._json.name,
        last_name: "",
        email: profile._json.email,
        age: null,
        password: "",
        role: profile._json.email == "adminCoder@coder.com" ? "admin" : "user"
      })

      return done(null, newUser)
    }
    catch(e) {
      return done("Error: "+e)
    }
  }))

  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser(async (id, done) => {
    const user = await UserModel.findById(id)
    done(null, user)
  })
}

export default initializePassport