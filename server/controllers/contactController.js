const Contact = require('../models/Contact');

exports.createContact = async (req, res) => {
  try {
    console.log('Received contact data:', req.body);
    const contact = new Contact(req.body);
    const savedContact = await contact.save();
    console.log('Saved contact:', savedContact);
    res.status(201).json(savedContact);
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ error: 'Failed to save contact.' });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const sortOrder = req.query.sort === 'asc' ? 1 : -1;
    const statusFilter = req.query.status;

    // Build search query
    const searchQuery = {};
    
    // Add search conditions if search term exists
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    // Add status filter if specified
    if (statusFilter && statusFilter !== 'all') {
      searchQuery.status = statusFilter;
    }

    const total = await Contact.countDocuments(searchQuery);

    const contacts = await Contact.find(searchQuery)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: contacts,
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
};

// Update contact status
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Contact ID is required' });
    }

    if (!['read', 'unread'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either "read" or "unread"' });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(updatedContact);
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ error: 'Failed to update contact status' });
  }
};

// Delete a contact message
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Contact ID is required' });
    }

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};

module.exports = exports;
