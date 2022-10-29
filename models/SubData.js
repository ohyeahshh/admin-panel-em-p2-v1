const mongoose = require('mongoose')

const SubData = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true 
		},
		email: { 
			type: String, 
			required: true, 
			unique: true 
		},
		password: {
			 type: String,
			  required: true 
		},
		company: { 
			// low-high-average
			type: String,
				
				},
				street: { 
			// 3 images
			type: String, 
			
			},
			postcode:{
			// Slider value
			type:Number,
			
			},
			location:{
			// Name of customer
			type: String,
			
			},
			phone:{
			// Phone number
			type: String,
			
			},
			vat:{
			// Address field 
			type: String,
			
			} ,
			radius:{
			// Address field 
			type: Number,
			
			} 
		
	},
	{ collection: 'subcontractors' }
)

const model = mongoose.model('SubData', SubData)

module.exports = model