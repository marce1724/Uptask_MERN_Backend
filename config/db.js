import mongoose from "mongoose"

const conectarBD = async() => {
    try {
         const connection = await mongoose.connect(
             process.env.MONGO_URI,
             {
                 useNewUrlParser : true,
                 useUniFiedTopology: true
            })
          
                                  

    } catch (error) {
         console.log(`error: ${error.message}`)  
         process.exit(1) 
    }
}

export default conectarBD