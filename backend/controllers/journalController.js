const Journal = require('../models/Journal');

// @desc    Get user journals
// @route   GET /api/journals
// @access  Private (Student)
const getJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new journal entry
// @route   POST /api/journals
// @access  Private (Student)
const createJournal = async (req, res) => {
  try {
    const { title, content, mood, tags, visibility } = req.body;

    if (!title || !content || !mood) {
      return res.status(400).json({ message: 'Title, content, and mood are required' });
    }

    const journal = await Journal.create({
      userId: req.user.id,
      title,
      content,
      mood,
      tags: tags || [],
      visibility: visibility || 'private'
    });

    res.status(201).json(journal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a journal entry
// @route   PUT /api/journals/:id
// @access  Private (Student - Owner)
const updateJournal = async (req, res) => {
  try {
    const { title, content, mood, tags, visibility } = req.body;

    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    // Verify ownership
    if (journal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to edit this journal' });
    }

    journal.title = title || journal.title;
    journal.content = content || journal.content;
    journal.mood = mood || journal.mood;
    journal.tags = tags || journal.tags;
    journal.visibility = visibility || journal.visibility;

    const updatedJournal = await journal.save();
    res.json(updatedJournal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a journal entry
// @route   DELETE /api/journals/:id
// @access  Private (Student - Owner)
const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    // Verify ownership
    if (journal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this journal' });
    }

    await journal.deleteOne();
    res.json({ message: 'Journal entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal
};
