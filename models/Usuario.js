import mongoose from "mongoose"
import  bcrypt from "bcrypt"

const usuarioShema = mongoose.Schema({
     nombre: {
          type: String,
          required: true,
          trim: true
     },
     password: {
         type: String,
         required: true,
         trim: true
     }, 
     email: {
         type: String,
         required: true,
         trim: true,
         unique: true
     },
     token:{
         type: String
     },
     confirmado:{
          type:  Boolean,
          default: false
     },
}, {
     timestamps: true
   }
)

//Encriptar password de usuario
usuarioShema.pre('save', async function(next){
      //si no esta modificando el usuario no volver a encriptar
      if(!this.isModified("password")){
           next();
      }
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt)
})

//Comprobar Password
usuarioShema.methods.comprobarPassword = async function(passwordFormulario){
      return await bcrypt.compare(passwordFormulario, this.password)
}

const Usuario = mongoose.model("Usuario", usuarioShema)

export default Usuario