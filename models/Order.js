const mongoose = require('mongoose')

const Order = new mongoose.Schema(
	{
		value: { 
            // low-high-average
            type: String,
             
             },
		images: {
            // data-urls x3
            type: Object,
            
             },
		len: { 
            // 3 images
            type: Number, 
            
         },
         sliderVal:{
            // Slider value
            type:Number,
            
         },
         name:{
            // Name of customer
            type: String,
            
         },
         email:{
            // Email of customer
            type: String,
            unique:true
         },
         contact:{
            // Phone number
            type: String,
            
         },
         address:{
            // Address field 
            type: String,
            
         },
         section:{
            // section needs to be cleared out, eg, Kitchen 
            type: String,
            
         },
         others:{
            // field when others is selected 
            type:String
         },
         method:{
            // lift or elevator 
            type: String
         },
         floor:{
            // floor no 
            type:Number,
            
         },
         date: {
            // date when moving is frequired 
            type:Date,
            
         },
         postcode:{
            // postcode 
            type:String,
            
         },
         city:{
            // city name
            type:String,
            
         },
       
         description:{
            // additional description
            type:String
         },
         orderstatus:{
            type: String,
         },
         stage:{
            type: Number,
         },
         cost:{
            type: Number,
         },
         createdon:{
            type:Date
         },
         subcontractor:{
            type:String
         },
         costone:{
            type:Number
         },
         costtwo:{
            type:Number
         },
         userper:{
            type:Number
         },
         subper:{
            type:Number
         },
         tokenId:{
            type:String
         },
         tokenCreatedOn : {
            type:Date
         },
         cancellationLog:{
            type:String
         },
         reason: {
            type:String
         },
			cancellationDate:{
            type:String
         } ,
         transId: {
            type:String
         },
         manualUserPayRemarks:{
            type:String
         },
         source:{
            type:String
         },
         userPayDate:{
            type:String
         },
         transIdsub: {
            type:String
         },
				manualSubPayRemarks:{
               type:String
            } ,
				sourceSub: {
               type:String
            },
				subcontractor: {
               type:String
            },
				subPayDate:{
               type:String
            }

	},
	{ collection: 'order' }
)

const model = mongoose.model('Order', Order)

module.exports = model