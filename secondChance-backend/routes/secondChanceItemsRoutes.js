const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        //Step 2: task 1 - insert code here
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const secondChanceItems = await collection.find({}).toArray();
        res.json(secondChanceItems);
    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item
router.post('/', upload.single('image'), async(req, res,next) => {
    try {

        //Step 3: task 1 - insert code here
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const newItem = { 
            name: req.body.name, 
            description: req.body.description, 
            price: req.body.price, 
            image: req.file ? req.file.filename : null, 
            createdAt: new Date() 
        }; 
        //Step 3: task 4 - insert into collection 
        const secondChanceItem = await collection.insertOne(newItem);
        res.status(201).json(secondChanceItem.ops[0]);
    } catch (e) {
        next(e);
    }
});

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        //Step 4: task 1 - insert code here
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const item = await collection.findOne({ _id: new ObjectId(req.params.id) });
        if (!item) { 
            return res.status(404).json({ message: 'Item not found' }); 
        } 
        res.json(item);
    } catch (e) {
        next(e);
    }
});

// Update and existing item
router.put('/:id', async(req, res,next) => {
    try {
        //Step 5: task 1 - insert code here
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const updateData = { 
            name: req.body.name, 
            description: req.body.description, 
            price: req.body.price, 
            updatedAt: new Date() 
        };
        if (req.file) { 
            updateData.image = req.file.filename; 
        }
        const result = await collection.findOneAndUpdate( 
            { _id: new ObjectId(req.params.id) }, 
            { $set: updateData }, 
            { returnDocument: 'after' } 
        );
        if (!result.value) { 
            return res.status(404).json({ message: 'Item not found' });
        } 
        res.json(result.value);
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async(req, res,next) => {
    try {
        //Step 6: task 1 - insert code here
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) })
        if (result.deletedCount === 0) { 
            return res.status(404).json({ message: 'Item not found' }); 
    }
    res.json({ message: 'Item deleted successfully' });
 
    } catch (e) {
        next(e);
    }
});

module.exports = router;
