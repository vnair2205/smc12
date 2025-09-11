// server/models/SupportTicket.js
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const SupportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportTicketCategory',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String
  }],
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  ticketNumber: {
    type: Number
  }
}, {
  timestamps: true
});

SupportTicketSchema.plugin(AutoIncrement, { inc_field: 'ticketNumber', start_seq: 1000 });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);