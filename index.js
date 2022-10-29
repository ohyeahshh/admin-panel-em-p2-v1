const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const express = require('express')
const app = express();
const cors = require('cors')
const mongoose = require('mongoose')
const {v4 : uuidv4} = require("uuid")

const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

const User = require("./models/User");
const Files = require("./models/Files");
const Order = require("./models/Order");
const SubData = require("./models/SubData");
const Query = require("./models/Query");


const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

app.use(cors())
app.use(express.json())
app.use(express.static('static'));


mongoose.connect(process.env.DATABASE_URI,
{useNewUrlParser: true, useUnifiedTopology:true,})

app.put('/api/cost', async (req, res) => {
	const id = req.body.id;
	const cost = req.body.cost;
	const userper = req.body.userper;
	const subper = req.body.subper;
	const email = req.body.email;
	const tokenId  = uuidv4()
	const TokenDate= new Date().toString()
	const TokenCreatedOn= TokenDate.substring(0,10)
	try{
		const result = await Order.updateOne({_id: id},{
			$set: {
				stage: 1,
				cost: cost,
				userper: userper,
				subper: subper,
				tokenId: tokenId,
				tokenCreatedOn: TokenCreatedOn
			}
		});
		console.log(result);
		res.json({ status: 'ok', text:'order updated successfully'})
	}
	catch(err){
		console.log(err);
		res.json({ status: 'error', error: err})
	}
})



app.get('/api/totalactive', (req,res) =>{
	Order.countDocuments({stage:1}).then((count_documents) =>{
		res.json({status:200, count:count_documents})
	}).catch((err) => {
	  console.log(err.Message);
	})
})


app.get('/api/totalnewreq', (req,res) =>{
	Order.countDocuments({stage:0}).then((count_documents) =>{
		res.json({status:200, count:count_documents})
	}).catch((err) => {
	  console.log(err);
	})
})

app.get('/api/totalcomplete', (req,res) =>{
	Order.countDocuments({stage:4}).then((count_documents) =>{
		res.json({status:200, count:count_documents})
	}).catch((err) => {
	  console.log(err.Message);
	})
})





//Reading except table: New orders
app.get('/api/read', (req,res) =>{
	const search = req.query.search;
	const skip = req.query.skip;
	const sort = req.query.sort;
	
	Order.find({ $or: [
		{name: {$regex: search, $options: "i" }},
		{email: {$regex: search, $options: "i" }},
		{address: {$regex: search, $options: "i" }},
		{contact: {$regex: search, $options: "i" }},
		{city: {$regex: search, $options: "i" }}
	],
	stage:0
	}).select({images:0 }).sort({createdon: sort}).limit(10).skip(skip).then((orders) =>{
		res.send(orders);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})

//Sent Offers
app.get('/api/getSentOffers', (req,res) =>{
	const search = req.query.search;
	const skip = req.query.skip;
	const sort = req.query.sort;

	Order.find({ $or: [
		{name: {$regex: search, $options: "i" }},
		{email: {$regex: search, $options: "i" }},
		{address: {$regex: search, $options: "i" }},
		{contact: {$regex: search, $options: "i" }},
		{city: {$regex: search, $options: "i" }}
	],
		stage:1
	}).select({images:0 }).sort({createdon: sort}).limit(10).skip(skip).then((orders) =>{
		res.send(orders);

	}).catch((err) =>{
		res.status(500).send(err);
	})
})


app.put('/api/cancelOrder', async(req, res) => {

	const cancellationId = req.body.id
	const cancellationLog = req.body.text
	const reason = req.body.reason
	const cancellationDate = req.body.cancellationDate

	try{
		const result = await Order.updateOne({_id: cancellationId},{
			$set: {
				cancellationLog: cancellationLog,
				reason: reason,
				cancellationDate: cancellationDate,
				stage: -1
				
			}
		});
		console.log(result);
		res.json({ status: 'ok', text:'Order cancelled successfully'})
	}
	catch(err){
		console.log(err);
		res.json({ status: 'error', error: err})
	}
})


//Cancelled offers
app.get('/api/cancelledOffers', (req,res) =>{
	const search = req.query.search;
	const skip = req.query.skip;
	const sort = req.query.sort;
	
	Order.find({ $or: [
		{name: {$regex: search, $options: "i" }},
		{email: {$regex: search, $options: "i" }},
		{address: {$regex: search, $options: "i" }},
		{contact: {$regex: search, $options: "i" }},
		{city: {$regex: search, $options: "i" }}
	],
	stage:-1
	}).select({images:0 }).sort({createdon: sort}).limit(10).skip(skip).then((orders) =>{
		res.send(orders);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})

app.get('/api/getCost', (req,res) =>{
	const revisionId = req.query.id;

	Order.findOne({_id:revisionId}).select({cost:1, userper:1, subper:1 }).then((data) =>{
		res.status(200).send(data);

	}).catch((err) =>{
		res.status(500).send(err);
	})
})

app.put('/api/costrevision', async (req, res) => {
	const id = req.body.id;
	const cost = req.body.cost;
	const userper = req.body.userper;
	const revisionRemarks = req.body.revisionRemarks;
	const revisionDate = req.body.revisionDate;
	const costRevisionLog = req.body.costRevisionLog;

	
	try{
		const result = await Order.updateOne({_id: id},{
			$set: {
				cost: cost,
				userper: userper,
				revisionRemarks: revisionRemarks,
				revisionDate: revisionDate,
				costRevisionLog : costRevisionLog
			}
		});
		console.log(result);
		res.json({ status: 'ok', text:'order updated successfully'})
	
	}
	catch(err){
		console.log(err);
		res.json({ status: 'error', error: err})
	}
})

app.put('/api/updateManualPay', async (req, res) => {
	console.log(req.body)
	const id = req.body.id;
	const transId = req.body.transId;
	const manualUserPayRemarks = req.body.manualUserPayRemarks;
	const source = req.body.source;
	
	try{
		const result = await Order.updateOne({_id: id},{
			$set: {
				transId: transId,
				manualUserPayRemarks: manualUserPayRemarks,
				source: source,
				stage: 2,
				userPayDate:new Date(Date.now).getDate()+"/" + (new Date(Date.now).getMonth() + 1) + "/" + new Date(Date.now).getFullYear()
			}
		});
		console.log(result);
		res.json({ status: 'ok', text:'payment updated successfully'})
	
	}
	catch(err){
		console.log(err);
		res.json({ status: 'error', error: err})
	}
})
app.put('/api/updateSubManualPay', async (req, res) => {
	console.log(req.body)

	const id = req.body.id;
	const transIdsub = req.body.transIdsub;
	const manualSubPayRemarks = req.body.manualSubPayRemarks;
	const sourceSub = req.body.sourceSub;
	const subcontractor = req.body.subcontractor;
	
	try{
		const result = await Order.updateOne({_id: id},{
			$set: {
				transIdsub: transIdsub,
				manualSubPayRemarks: manualSubPayRemarks,
				sourceSub: sourceSub,
				subcontractor:subcontractor,
				stage:4,
				subPayDate:new Date(Date.now).getDate()+"/" + (new Date(Date.now).getMonth() + 1) + "/" + new Date(Date.now).getFullYear()
			}
		});
		console.log(result);
		res.json({ status: 'ok', text:'payment updated successfully'})
	
	}
	catch(err){
		console.log(err);
		res.json({ status: 'error', error: err})
	}
})

app.put('/api/updateManualPay', async (req, res) => {
	console.log(req.body)

	const id = req.body.id;
	const transIdsub = req.body.transIdsub;
	const manualSubPayRemarks = req.body.manualSubPayRemarks;
	const sourceSub = req.body.sourceSub;
	const subcontractor = req.body.subcontractor;
	
	try{
		const result = await Order.updateOne({_id: id},{
			$set: {
				transIdsub: transIdsub,
				manualSubPayRemarks: manualSubPayRemarks,
				sourceSub: sourceSub,
				subcontractor:subcontractor,
				stage:4,
				subPayDate:new Date(Date.now).getDate()+"/" + (new Date(Date.now).getMonth() + 1) + "/" + new Date(Date.now).getFullYear()
			}
		});
		console.log(result);
		res.json({ status: 'ok', text:'payment updated successfully'})
	
	}
	catch(err){
		console.log(err);
		res.json({ status: 'error', error: err})
	}
})



//Accepted Offers
app.get('/api/acceptedOffers', (req,res) =>{
	const search = req.query.search;
	const skip = req.query.skip;
	const sort = req.query.sort;
	
	Order.find({ $or: [
		{name: {$regex: search, $options: "i" }},
		{email: {$regex: search, $options: "i" }},
		{address: {$regex: search, $options: "i" }},
		{contact: {$regex: search, $options: "i" }},
		{city: {$regex: search, $options: "i" }}
	],
	stage:2
	}).select({images:0 }).sort({createdon: sort}).limit(10).skip(skip).then((orders) =>{
		res.send(orders);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})

app.put('/api/sendToSub', async (req, res) => {
	const id = req.body.id;
	
	
	try{
		const result = await Order.updateOne({_id: id},{
			$set: {
				stage: 3
			}
		});
		console.log(result);
		res.json({ status: 'ok', text:'sent to subcontractors successfully'})
	
	}
	catch(err){
		console.log(err);
		res.json({ status: 'error', error: err})
	}
})

//Sent to subcontractor
app.get('/api/sentToSub', (req,res) =>{
	const search = req.query.search;
	const skip = req.query.skip;
	const sort = req.query.sort;
	
	Order.find({ $or: [
		{name: {$regex: search, $options: "i" }},
		{email: {$regex: search, $options: "i" }},
		{address: {$regex: search, $options: "i" }},
		{contact: {$regex: search, $options: "i" }},
		{city: {$regex: search, $options: "i" }}
	],
	stage:3
	}).select({images:0 }).sort({createdon: sort}).limit(10).skip(skip).then((orders) =>{
		res.send(orders);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})

// Active Orders
app.get('/api/activeOrders', (req,res) =>{
	const search = req.query.search;
	const skip = req.query.skip;
	const sort = req.query.sort;
	
	Order.find({ $or: [
		{name: {$regex: search, $options: "i" }},
		{email: {$regex: search, $options: "i" }},
		{address: {$regex: search, $options: "i" }},
		{contact: {$regex: search, $options: "i" }},
		{city: {$regex: search, $options: "i" }}
	],
	stage:4
	}).select({images:0 }).sort({createdon: sort}).limit(10).skip(skip).then((orders) =>{
		res.send(orders);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})
//Reading completed orders
app.get('/api/completedOrders', (req,res) =>{
	const search = req.query.search;
	const skip = req.query.skip;
	const sort = req.query.sort;

	Order.find({ $or: [
		{name: {$regex: search, $options: "i" }},
		{subcontractor: {$regex: search, $options: "i" }},
		{email: {$regex: search, $options: "i" }}
	],
		stage:5
	}).select({images:0 }).limit(10).skip(skip).then((orders) =>{
		res.send(orders);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})



//Reading users for revenue
app.get('/api/revenue', (req,res) =>{
	const search = req.query.search;
	const skip = req.query.skip;
	const sort = req.query.sort;
	Order.find({ $or: [
		{name: {$regex: search, $options: "i" }},
		{subcontractor: {$regex: search, $options: "i" }},
		{email: {$regex: search, $options: "i" }}
	],
	stage:{$gt:1}
	}).select({images:0 }).sort({created_on:sort}).limit(10).skip(skip).then((orders) =>{
		res.send(orders);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})


app.get('/api/edit', (req,res) =>{
	const user_id = req.query.id;

	Order.findOne({_id:user_id}).select({images:0 }).then((orders) =>{
		res.send(orders);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})

app.get('/api/userDetails', (req,res) =>{
	const user_id = req.query.id;

	Order.findOne({_id:user_id}).select({cost: 1, userper: 1, name: 1, section:1 }).then((orders) =>{
		res.send(orders);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})


app.get('/api/viewNewReq', (req,res) =>{
	console.log(req.body)
	const viewNewRequestId = req.query.id;
	Order.findOne({_id:viewNewRequestId}).then((data) =>{
		res.status(200).send(data);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})

app.get('/api/userSubDetails', (req,res) =>{
	const user_id = req.query.id;

	Order.findOne({_id:user_id}).select({cost: 1, subper: 1, name: 1, section:1 }).then((orders) =>{
		res.send(orders);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})
//Subcontractors

app.get('/api/viewsubdata', (req,res) =>{
	const viewSub_id = req.query.id;
	SubData.findOne({_id:viewSub_id}).then((sub) =>{
		res.status(200).send(sub);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})

app.get('/api/editSub', (req,res) =>{
	console.log(req.body)
	const sub_id = req.query.id;

	SubData.findOne({_id:sub_id}).then((subinfo) =>{
		res.status(200).send(subinfo);

	}).catch((err) =>{
		res.status(500).send(err);
	})
})

app.get('/api/viewactive', (req,res) =>{
	const viewActive_id = req.query.id;
	Order.findOne({_id:viewActive_id}).select({images:0 }).then((order) =>{
		res.status(200).send(order);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})

app.get('/api/viewsubfile', (req,res) =>{
	const email = req.body.email
	SubData.findOne({email:email}).then((sub) =>{
		res.status(200).send(sub);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})

app.post('/api/sendfile', async (req, res) => {

	try{
		if(req.body.file!==''){
		await Files.create({
			file: req.body.file,
			email: req.body.email,
		})
		res.json({ status: 'ok' })
	}
	else{
		res.json({ status: 'error', error: 'No file found' })
	}
	}
	catch (err) {
		res.json({ status: 'error', error: 'Upload Failed' })
	}
})

// [Subcontractors => Edit => Update]
app.put('/api/updateSubInfo', async(req, res) => {
	console.log(req.body.id)
	const newid = req.body.id
	const newname = req.body.name
	const newcompany = req.body.company
	const newphone = req.body.phone
	const newemail = req.body.email
	const newpostcode = req.body.postcode
	const newlocation= req.body.location
	const newstreet = req.body.street
	const newradius = req.body.radius
	const newvat = req.body.vatId
	
	try{
		const result = await SubData.updateOne({_id: newid},{
			$set: {
				name: newname,
				company: newcompany,
				phone: newphone,
				email:newemail,
				postcode: newpostcode,
				location: newlocation,
				street: newstreet,
				radius: newradius,
				vat: newvat
			}
		});
		console.log(result);
		res.json({ status: 'ok', text:'Subcontractor info updated successfully'})
	}
	catch(err){
		console.log(err);
		res.json({ status: 'error', error: err})
	}
})


//updating edited orders
app.put('/api/updateorder', async(req, res) => {
	const newid = req.body.id
	const newvalue = req.body.value
	const newsliderVal = req.body.sliderVal
	const newname = req.body.name
	const newemail = req.body.email
	const newcontact = req.body.contact
	const newaddress = req.body.address
	const newsection = req.body.section
	const newothers = req.body.others
	const newmethod = req.body.method
	const newfloor = req.body.floor
	const newpostcode = req.body.postcode
	const newdate = req.body.date
	const newcity = req.body.city
	const newdescription = req.body.description
	const neworderstatus = req.body.orderstatus
	const newstage=req.body.stage
	const newcost=req.body.cost


	try{
		const result = await Order.updateOne({_id: newid},{
			$set: {
				name: newname,
				email:newemail,
				sliderVal:newsliderVal,
				value:newvalue,
	 			contact:newcontact ,
				address:newaddress,
				section:newsection,
				others : newothers,
				method : newmethod,
				floor : newfloor,
				date : newdate,
				postcode:newpostcode,
				city:newcity,
				stage: newstage,
				cost: newcost,
				description :newdescription,
				orderstatus : neworderstatus
			}
		});
		console.log(result);
		res.json({ status: 'ok', text:'order updated successfully'})
	}
	catch(err){
		console.log(err);
		res.json({ status: 'error', error: err})
	}
})

app.get('/api/show', (req,res) =>{
	const search = req.query.search;
	const skip = req.query.skip;
	const sort = req.query.sort;
	SubData.find({ $or: [
		{name: {$regex: search, $options: "i" }},
	{email: {$regex: search, $options: "i" }},
	{phone: {$regex: search, $options: "i" }},
	{location: {$regex: search, $options: "i" }}
	]
	}).select({images:0 }).limit(10).skip(skip).then((sub) =>{
		res.send(sub);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})


app.post('/api/delete', async (req, res) => {
	const id = req.body.id;
	try {
		 SubData.findByIdAndRemove(id).exec()
		res.json({ status: 'ok', text:'subcontractor deleted'})
		// console.log("id from server",id)
	} catch (err) {
		res.json({ status: 'error', error: err })
	}
})



//

//Order
app.post('/api/remove', async (req, res) => {
	const id = req.body.id;
	try {
		 Order.findByIdAndRemove(id).exec()
		res.json({ status: 'ok', text:'order deleted'})
	} catch (err) {
		res.json({ status: 'error', error: err })
	}
})


app.delete('/api/delete', async (req, res) => {
	const id = req.body.id;
	await Order.findByIdAndRemove(id).exec()
	res.send("Item Deleted")
	
})

// app.post("api/delete" , async(req,res) => {

//     const del_id =  req.body.id;
//        ToDoModel.findByIdAndRemove(del_id , (err,result) => {
//         if(err){
//             res.send(err);
//         }
//         res.send(result);
//       })  
// })

app.post('/api/register', async (req, res) => {
	console.log(req.body.password)
	try {
		const newPassword = await bcrypt.hash(req.body.password, 10)
		// console.log(newPassword)
		await User.create({
			name: req.body.name,
			email: req.body.email,
			password: newPassword,
		})
		res.json({ status: 'ok' })
	} catch (err) {
		res.json({ status: 'error', error: 'Duplicate email' })
	}
})


app.post('/api/login', async (req, res) => {
	const user = await User.findOne({
		email: req.body.email,
	})

	if (!user) {
		// console.log("No user with such email found")
		return res.json({ status: 'error', user: false, remarks: "Email or Password is not valid" })
	}
	else{
		// console.log("email is valid")
		// console.log("pass is ", user.password)
		const isPasswordValid = await bcrypt.compare(
			req.body.password,
			user.password
		)
	
		if (isPasswordValid) {
			// console.log("pass is valid")
			const token = jwt.sign(
				{
					name: user.name,
					email: user.email,
				},
				'secret123'
			)
	
			return res.json({ status: 'ok', user: token })
		} else {
			// console.log("pass is not valid")
			return res.json({ status: 'error', user: false, remarks: "Email or Password is not valid" })
		}
	}


})



app.put('/api/complete', async(req, res) => {
	const newid = req.body.id
	const newsection = req.body.section
	const newothers = req.body.others
	const newmethod = req.body.method
	const newfloor = req.body.floor
	const newpostcode = req.body.postcode
	const newdate = req.body.date
	const newcity = req.body.city
	const newdescription = req.body.description
	const neworderstatus = req.body.orderstatus

	try{
		const result = await Order.updateOne({_id: newid},{
			$set: {
				section : newsection,
				others : newothers,
				method : newmethod,
				floor : newfloor,
				postcode : newpostcode,
				date : newdate,
				city : newcity,
				description :newdescription,
				orderstatus : neworderstatus,
			}
		});
		console.log(result);
		res.json({ status: 'ok', text:'stored successfully'})
	}
	catch(err){
		console.log(err);
		res.json({ status: 'error', error: err})
	}
})

//Order
app.post('/api/order', async (req, res) => {
	console.log(req.body)
	try {
		await Order.create({
			value: req.body.value,
			images : req.body.images,
			length : req.body.length,
			sliderVal : req.body.sliderVal,
			name : req.body.name,
			email : req.body.email,
			contact : req.body.contact,
			address : req.body.address,
			section : req.body.section,
			others : req.body.others,
			method: req.body.method,
			floor: req.body.floor,
        	date : req.body.date,
			postcode : req.body.postcode,
			city : req.body.city,
			description : req.body.description,
			orderstatus : req.body.orderstatus,
			stage : req.body.stage,
			cost : req.body.cost,
			createdon:new Date(),
			subcontractor:"",
			costone:0,
			costtwo:0
		})
		res.json({ status: 'ok', text:'stored successfully'})
	} catch (err) {
		res.json({ status: 'error', error: err })
	}
})

//Queries
app.get('/api/showquery', (req,res) =>{
	const query_id = req.query.id;

	Query.findOne({_id:query_id}).then((orders) =>{
		res.status(200).send(orders);
		// console.log(orders)
	}).catch((err) =>{
		res.status(500).send(err);
	})
})

app.get('/api/query', (req,res) =>{
	const search = req.query.search;
	const skip = req.query.skip;
	const sort = req.query.sort;
	Query.find({ $or: [
		{name: {$regex: search, $options: "i" }},
		{email: {$regex: search, $options: "i" }}
	]
	}).sort({createdon:sort}).limit(10).skip(skip).then((queries) =>{
		res.send(queries);
	}).catch((err) =>{
		res.status(500).send(err);
	})
})

app.post('/api/deletequery', async (req, res) => {
	const id = req.body.id;
	try {
		 Query.findByIdAndRemove(id).exec()
		res.json({ status: 'ok', text:'Query deleted'})
		// console.log("query id from server",id)
	} catch (err) {
		res.json({ status: 'error', error: err })
	}
})


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/index.html'));
});

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () =>
  console.log(`Sever running on port ${PORT}`)
);


process.on("unhandledRejection", (err, promise) => {
	console.log(`Logged Error: ${err.message}`);
	server.close(() => process.exit(1));
  });