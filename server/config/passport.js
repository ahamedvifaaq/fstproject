import passport from "passport";
import{Strategy as GoogleStrategy} from "passport-google-oauth20";
import User from "../models/User.js";
import { refreshToken } from "../controllers/authcontroller.js";

passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async(accessToken,refreshToken,profile,done)=>{
        try{
            let user=await User.findOne({email:profile.emails[0].value});

            if(!user){
                user=await User.create({
                    username:profile.displayName,
                    email:profile.emails[0].value,
                    googleId:profile.id,
                })
            }
            return done(null,user);
        }catch(err){
            return done(err,null);
        }
    }
));

export default passport;