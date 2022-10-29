const mongoose = require('mongoose')

const Query = new mongoose.Schema(
	{
		name: { 
            // low-high-average
            type: String,
             
             },
		phone: {
            // data-urls x3
            type: Number,
            
             },
		pin: { 
         
            type: Number, 
            
         },
         email:{
            // Slider value
            type: String,
            
         },
         query:{
            // Name of customer
            type: String,
            
         },
         status:{
            type:String
         },
         createdon:{
            type:Date
         }
	},
	{ collection: 'query' }
)

const model = mongoose.model('Query', Query)

module.exports = model