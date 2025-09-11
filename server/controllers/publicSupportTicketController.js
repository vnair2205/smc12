// server/controllers/publicSupportTicketController.js
const SupportTicket = require('../models/SupportTicket');
const SupportTicketCategory = require('../models/SupportTicketCategory');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/tickets';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('File type not allowed!'), false);
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 5 } }); // 5MB limit

exports.getTicketByIdForUser = async (req, res) => {
  try {
    console.log(`[DEBUG] Attempting to find ticket with ID: ${req.params.id}`);
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('category', 'name')
      .populate('assignedTo', 'firstName lastName')
      .populate('conversation.user', 'firstName lastName');

    if (!ticket) {
      console.log('[DEBUG] Ticket not found in database.');
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // --- DEBUGGING BLOCK ---
    const ticketOwnerId = ticket.user._id.toString();
    const requesterId = req.user.id;
    
    console.log(`[DEBUG] Ticket Owner ID: ${ticketOwnerId}`);
    console.log(`[DEBUG] Requester User ID (from token): ${requesterId}`);
    console.log(`[DEBUG] Are IDs equal? ${ticketOwnerId === requesterId}`);
    // --- END DEBUGGING BLOCK ---

    // Security Check: Ensure the ticket belongs to the user making the request
    if (ticketOwnerId !== requesterId) {
      console.log('[DEBUG] Authorization FAILED: User does not own this ticket.');
      return res.status(403).json({ msg: 'User not authorized' });
    }

    console.log('[DEBUG] Authorization SUCCESSFUL.');
    res.json(ticket);
  } catch (err) {
    console.error('!!! [ERROR] fetching ticket by ID for user:', err.message);
    res.status(500).send('Server Error');
  }
};


exports.createTicket = async (req, res) => {
  const { category, subject, description, priority } = req.body;
  try {
    const newTicket = new SupportTicket({
      user: req.user.id,
      category,
      subject,
      description,
      priority,
      attachments: req.files.map(file => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype
      }))
    });
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    console.error('Error creating ticket:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const { sortBy = 'newest', search = '' } = req.query;
    const query = { user: req.user.id };
    if (search) {
      query.ticketNumber = parseInt(search, 10);
    }
    const sortOption = sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const tickets = await SupportTicket.find(query).sort(sortOption).populate('category', 'name');
    res.json(tickets);
  } catch (err) {
    console.error('Error fetching user tickets:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.getSupportCategories = async (req, res) => {
  try {
    const categories = await SupportTicketCategory.find().sort({ name: 1 });
    if (!categories) {
        return res.status(404).json({ msg: 'Categories not found' });
    }
    res.json(categories);
  } catch (err) {
    console.error('Error fetching support categories:', err.message);
    res.status(500).send('Server Error');
  }
};