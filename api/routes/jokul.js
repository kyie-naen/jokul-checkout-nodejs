const express = require('express');
const router = express.Router();
const axios = require('axios');
// const http = require('http')



const Jokul = require('../../jokul/core');
const jokul = new Jokul();

router.post('/', (req, res, next) => {

  //save details
  let random = jokul.randomData()
  let timeStamp = jokul.timeStamp()
  let requestTarget = '/checkout/v1/payment'

  //server Destination
  // if (req.body.server == 'Sandbox') {
  //   let domain = 'https://api-sandbox.doku.com';
  // }else {
  //   let domain = 'https://api.doku.com';
  // }

  let url = 'https://api-sandbox.doku.com'+ requestTarget;

  //params body
  const body = JSON.stringify({
    order: {
        amount: req.body.amount,
        invoice_number: "INV-"+random+"-CHECKOUT",
        line_items: [
            {
                name: "INV-"+random+"-CHECKOUT",
                price: req.body.amount,
                quantity: 1
            }
        ],
        currency: "IDR",
        callback_url: "https://doku.com/",

    },
    payment: {
        payment_due_date: 60
    },
    customer: {
        id: "CUST-0001",
        name: "Rizky Zulkarnaen",
        email: "rizky.zulkarnaen92@gmail.com"
    }
  });

  let digest = jokul.digest(body);

  let signature = jokul.signature(req.body.client, req.body.clientSecret, random, timeStamp, requestTarget, digest)

  axios.post(url, body, {
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': req.body.client,
      'Request-Id': random,
      'Request-Timestamp': timeStamp,
      'Signature': signature
    }
  }).then(response => {
      console.log(response.data)
      res.status(200).json({
        payment: response.data.response.payment.url
      })
  }).catch(error => {
      console.log(error.response)
  });

});

module.exports = router
