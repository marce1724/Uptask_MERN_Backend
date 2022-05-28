import Usuario from "../models/Usuario.js"
import generarId from "../helpers/generarId.js"
import generarJWT from "../helpers/generarJWT.js"
import {emailRegistro, emailOlvidePassword}  from "../helpers/email.js"


const registrar = async (req, res) =>{
     //Evitar registros duplicados
     const {email} = req.body
     const existeUsuario = await Usuario.findOne({email})

     console.log(existeUsuario)
     
     if(existeUsuario){
          const error = new Error("Usuario ya registrado")
          return res.status(400).json({msg: error.message})
     }

     try {
          const usuario = new Usuario(req.body)
          usuario.token = generarId()
          await usuario.save()

          //Enviar email de confirmación 
          emailRegistro({
             email: usuario.email,
             nombre: usuario.nombre,
             token: usuario.token
          })

          res.json({msg: "Usuario creado correctamente, Revisa tu email para confirmar tu cuenta"}) 
          
         
     } catch (error) {
          console.log(error)
     }
}


const autenticar = async (req, res) =>{
      // Comprobar si el usuario existe
      const {email, password} = req.body
      const usuario = await Usuario.findOne({email})

      if(!usuario){
            const error = new Error("El usuario no existe")
            return res.status(404).json({msg: error.message})
      }

      // Comprobar si ya esta confirmado
      if(!usuario.confirmado){
            const error = new Error("Tu cuenta no ha sido confirmada")
            return res.status(403).json({msg: error.message})
      }

      // Confirmar Password
      if(await usuario.comprobarPassword(password)){
           res.json({
                 _id: usuario._id,
                 nombre: usuario.nombre,
                 usuario: usuario.email,
                 token: generarJWT(usuario._id)
           }) 

      }else{
           const error = new Error("El Password es Incorrecto")
           return res.status(403).json({msg: error.message})
      }
}


const confirmar = async (req, res) =>{
      const {token} = req.params
      const usuarioConfirmar = await Usuario.findOne({token})

      if(!usuarioConfirmar){
           const error = new Error("Token no válido")
           return res.status(403).json({msg: error.message})
      }

      try {
            usuarioConfirmar.confirmado = true
            usuarioConfirmar.token = ""
            await usuarioConfirmar.save()
            res.json({msg: "Usuario confirmado correctamente" })
           
      } catch (error) {
            console.log(error)
      }
}


const olvidePassword = async(req, res) =>{
      // Comprobar si el usuario existe
     const {email, password} = req.body
     const usuario = await Usuario.findOne({email})
 
      if(!usuario){
           const error = new Error("El usuario no existe")
           return res.status(404).json({msg: error.message})
      }

      try {
            usuario.token = generarId()
            await usuario.save()

            //Enviar email con nuevo password
            emailOlvidePassword({
                   email: usuario.email,
                   nombre: usuario.nombre,
                   token: usuario.token
            })

            res.json({msg:"Hemos enviado un email con las instrucciones"})
           
      } catch (error) {
            console.log(error)
      }
}


const comprobarToken = async(req, res) =>{
       const {token} = req.params
       const tokenValido = await Usuario.findOne({token})

       if(tokenValido){
             res.json({msg: "Token válido y el usuario existe"})

       }else{
             const error = new Error("Token no válido")
             return res.status(404).json({msg: error.message}) 
       }
}

const nuevoPassword = async(req, res) =>{
       const {token} = req.params
       const {password} = req.body
       const usuario = await Usuario.findOne({token})

       if(usuario){
             try {
                   usuario.password = password
                   usuario.token = ""
                   await usuario.save()
                   res.json({msg: "Password modificada correctamente"})

             } catch (error) {
                    console.log(error)
             }
       }else{
             const error = new Error("Token no válido")
             return res.status(404).json({msg: error.message}) 
       }
}

const perfil = async(req, res) =>{
   const { usuario } = req
   res.json(usuario)
}


export{
     registrar,
     autenticar,
     confirmar,
     olvidePassword,
     comprobarToken,
     nuevoPassword,
     perfil
}