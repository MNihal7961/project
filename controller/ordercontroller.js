const global = require("../global/globalfunction");
const orderHelper = require("../helper/orderhelpers");
const razorpayHelper = require("../helper/razorpayhelpers");
const {ObjectId}=require('mongodb')
const order=require('../model/ordermodel')
const easyInvoice=require('../service/easyinvoice')
const path = require('path')

// USER PLACE-ORDER
const placeorder_post = async (req, res) => {
  const { address, payment, shipping, summary } = req.body;
  try {
    const userData = await global.loggedUser(req.session.email);
    const orderShipping = await global.selectShipping(shipping);
    const orderAddress = await global.selectAddress(userData._id, address);
    const orderPrice = global.overallPrice(summary, orderShipping.charge);
    const orderPayment = req.body.payment;

    if(payment=="Drip-Wallet"){
      await orderHelper.placeOrderWallet(userData, orderShipping, orderAddress, orderPrice, payment).then(async (orderId)=>{
             res.json({wallet:true})
     })
    }else{
      await orderHelper.placeOrder(userData, orderShipping, orderAddress, orderPrice, payment)
      .then(async (orderId) => {
        if (orderPayment == "COD") {
          res.json({ codstatus: true });
        }else {
          razorpayHelper
            .generateRazorPay(userData._id, orderPrice)
            .then((order) => {
              res.json(order);
            })
        }
      });
    }
  } catch (err) {
    res.status(500).render('500')
    throw err;
  }
};

// VERIFY-ONLINEPAYMENT
const verifyPayment = async (req, res) => {
  const userData = await global.loggedUser(req.session.email);
  console.log(req.body);
  const { payment, order } = req.body;
  try {
    orderHelper
      .verifyPayment(payment)
      .then(() => {
        res.json({ status: true });
      })
      .catch((err) => {
        res.json({ status: false });
      });
  } catch (err) {
    res.status(500).render('500')
    console.log(err);
  }
};

// USER ORDER-SUCCESS
const ordersuccess_get = async (req, res) => {
  try {
    const title = "order-success";
    const userData = await global.loggedUser(req.session.email);
    const cartNo = await global.cartCount(userData._id);
    const wishlistNo=await global.wishlistNo(userData._id)
    res.render("user-order-success", { title, userData, cartNo ,wishlistNo});
  } catch (err) {
    res.status(500).render('500')
    console.log(err);
  }
};

// USER ORDER-DETAILS
const orderdetails_get = async (req, res) => {
  try {
    const title = "order-details";
    const userData = await global.loggedUser(req.session.email);
    const cartNo = await global.cartCount(userData._id);
    const orderData = await global.getUserOrders(userData._id);
    const productDetails = await global.getProductDetailsFromOrder(userData._id);
    const count = await global.getOrderProductStatusCount(userData._id);
    const countsArray = count.map(item => item.count)
    const sum = countsArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    var i = 0;
    const wishlistNo=await global.wishlistNo(userData._id)
    res.render("user-orders", {
      title,
      cartNo,
      userData,
      orderData,
      productDetails,
      i,
      sum,
      wishlistNo
    });
  } catch (err) {
    res.status(500).render('500')
    console.log(err);
  }
};

// ADMIN-ORDERS
const adminorder_get = async (req, res) => {
 try{
  const title = "orders";
  var i = 0;
  const productData = await global.getAllOrderProduct();
  const orderData = await global.getAllOrder();
  console.log(orderData)
  res.render("admin-order", { title, i, orderData, productData });
 }catch(err){
  res.status(500).render('500')
 }
};

// ADMIN PROCESS-ORDER
const adminorderprocess_post = async (req, res) => {
  const { orderId, status } = req.body;
  try {
    await orderHelper
      .adminProcessOrder(orderId, status)
      .then(async (response) => {
        res.json({ updateStatus: true });
      });
  } catch (err) {
    res.status(500).render('500')
    console.log(err);
  }
};

// ADMIN PLACE-ORDER
const adminorderplaced_post = async (req, res) => {
  const { orderId, status } = req.body;
  try {
    await orderHelper
      .adminPlaceOrder(orderId, status)
      .then(async (response) => {
        res.json({ updateStatus: true });
      });
  } catch (err) {
    res.status(500).render('500')
    console.log(err);
  }
};

// ADMIN SHIP-ORDER
const adminordershipped_post = async (req, res) => {
  const { orderId, status } = req.body;
  try {
    await orderHelper.adminShipOrder(orderId, status).then(async (response) => {
      res.json({ updateStatus: true });
    });
  } catch (err) {
    res.status(500).render('500')
    console.log(err);
  }
};

// ADMIN DELIVER-ORDER
const adminorderdelivered_post = async (req, res) => {
  const { orderId, status } = req.body;
  try {
    await orderHelper
      .adminDeliveryOrder(orderId, status)
      .then(async (response) => {
        res.json({ updateStatus: true });
      });
  } catch (err) {
    res.status(500).render('500')
    console.log(err);
  }
};

// USER CANCEL-ORDER
const userordercancel_post = async (req, res) => {
  const userData = await global.loggedUser(req.session.email);

  try {
    const { orderId ,reason} = req.body;
    await orderHelper
      .userCancelOrder(orderId, userData._id,reason)
      .then(async (response) => {
        res.json({ updateStatus: true });
      });
  } catch (err) {
    res.status(500).render('500')
    console.log(err);
  }
};

// USER CANCEL-SINGLEPRODUCT
const userordersingleproductcancel_post = async (req, res) => {
  console.log("WORKED");
  const userData = await global.loggedUser(req.session.email);
  try {
    const { orderId, productName, productSize,productQuantity,productPrice} = req.body;
    console.log(req.body);
    await orderHelper
      .userCancelSingleProduct(userData._id, orderId, productSize, productName,parseInt(productQuantity),parseInt(productPrice))
      .then(async (response) => {
        res.json({ updateStatus: true });
      });
  } catch (err) {
    res.status(500).render('500')
    console.log(err);
  }
};

// USER RETURN-ORDER
const userorderreturn_post = async (req, res) => {
  const userData = await global.loggedUser(req.session.email);

  try {
    const { orderId ,reason} = req.body;
    console.log(req.body);
    await orderHelper
      .userReturnOrderRequest(orderId, userData._id,reason)
      .then(async (response) => {
        res.json({ updateStatus: true });
      });
  } catch (err) {
    res.status(500).render('500')
    console.log(err);
  }
};

// ADMIN RETURN-REQUESTS
const adminReturnRequests_get=async (req,res)=>{
  try{
    const orderData=await global.getAllReturnRequestOrder()
    const productData=await global.getAllReturnRequestOrderProduct()
    var i=0
    const title="returns"
    res.render('admin-return',{title,orderData,productData,i})
  }catch(err){
    res.status(500).render('500')
    console.error(err)
  }
}

// ADMIN CANCELORDER-LISTS
const adminCancelorders_get=async(req,res)=>{
  try{
    const title="cancels"
    const orderData=await global.getAllCancelledOrder()
    const productData=await global.getAllCancelledOrderProduct()
    var i=0
    res.render('admin-cancel-orders',{title,orderData,i,productData})
  }catch(err){
    res.status(500).render('500')
  }
}

// ADMIN DELIVEREDORDER-LISTS
const adminDeliveredOrders_get=async(req,res)=>{
  try{
    const title="order-delivered"
    const orderData=await global.getAllDeliveredOrder()
    const productData=await global.getAllDeliveredOrderProduct()
    var i=0
    res.render('admin-order-delivered',{title,i,orderData,productData})
  }catch(err){
    console.error(err)
    res.status(500).render('500')
  }
}

// ADMIN RETURNEDORDER-LISTS
const adminReturnedOrders_get=async(req,res)=>{
  try{
    const title="returned-orders"
    const orderData=await global.getAllReturnedOrder()
    const productData=await global.getAllReturnedOrderProduct()
    var i=0
    res.render('admin-order-returned',{title,i,orderData,productData})
  }catch(err){
    console.error(err)
    res.status(500).render('500')
  }
}

// ADMIN RETURNORDER-CONFIRM
const adminReturnOrderConfirm_post=async(req,res)=>{
  try{
    const total=req.body.total
    const id=req.params.id
    const update=await orderHelper.adminConfirmReturn(total,id)
    if(update){
      res.redirect('/admin/return/requests?message=success')
    }
  }catch(err){
    console.error(err)
    res.status(500).render('500')
  }
}

// ADMIN RETURNORDER-REJECT
const adminReturnOrderReject_post=async(req,res)=>{
  try{
    const reason=req.body.reason
    const id=req.body.orderId
    console.log(reason,"///////////////////////")
    console.log(id,"////////////////////////////")
    const update=await orderHelper.adminRejectReturn(id,reason)
    if(update){
      res.redirect('/admin/return/requests?message=success')
    }
  }catch(err){
    console.error(err)
  }
}

// ADMIN RETURNREJECTORDER-LISTS
const adminReturnRejectOrders_get=async(req,res)=>{
  try{
    const title="Rejected Return"
    const orderData=await global.getAllReturnRejectOrder()
    const productData=await global.getAllReturnRejectOrderProduct()
    res.render('admin-reject-return-orders',{title,orderData,productData})
  }catch(err){
    console.error(err)
    res.status(500).render('500')
  }
}

const generateInvoices=async(req,res)=>{
    try {
      const userData = await global.loggedUser(req.session.email);
      const { orderId } = req.body
      const orderData = await orderHelper.orderDataForInvoice(userData._id,orderId)
      if (orderData) {
          const invoice = await easyInvoice.generateInvoice(orderData)
          res.json({ success: true, message: 'Invoice generated successfully' });
      } else {
          res.status(500).json({ success: false, message: 'Failed to generate the invoice' });
      }
  } catch (err) {
      console.error(err)
  }
}

const downloadInvoice=async (req,res)=>{
  try {
    const id = req.params.orderId      
    const filePath = path.join(__dirname, '../public/pdf', `${id}.pdf`);
    res.download(filePath,'Drip.pdf')
  } catch (error) {
    console.error('Error in downloading the invoice:', error);
    res.status(500).json({ success: false, message: 'Error in downloading the invoice' });
  }
}

module.exports = {
  placeorder_post,
  ordersuccess_get,
  orderdetails_get,
  adminorder_get,
  adminorderprocess_post,
  adminorderplaced_post,
  adminordershipped_post,
  adminorderdelivered_post,
  userordercancel_post,
  userordersingleproductcancel_post,
  verifyPayment,
  userorderreturn_post,
  adminReturnRequests_get,
  adminCancelorders_get,
  adminDeliveredOrders_get,
  adminReturnedOrders_get,
  adminReturnOrderConfirm_post,
  adminReturnOrderReject_post,
  adminReturnRejectOrders_get,
  generateInvoices,
  downloadInvoice
};
