const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTicket,
  getUserTickets,
  upload,
  getSupportCategories // 1. Import the new function
} = require('../controllers/publicSupportTicketController');

router.use(auth);


router.get('/categories', getSupportCategories);

router.route('/')
  .post(upload.array('attachments', 5), createTicket)
  .get(getUserTickets);

module.exports = router;