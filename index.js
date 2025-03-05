const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const MenuItem = require('./MenuItem');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3010;

app.use(bodyParser.json());

mongoose.connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB Connection Error:', err));

app.post('/menu', async (req, res) => {
    try {
        const { name, description, price } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Name and price are required' });
        }
        const newItem = new MenuItem({ name, description, price });
        await newItem.save();
        res.status(201).json({ message: 'Menu item added successfully', item: newItem });
    } catch (error) {
        res.status(500).json({ error: 'Error adding menu item', details: error.message });
    }
});

app.get('/menu', async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.status(200).json(menuItems);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching menu items', details: error.message });
    }
});

app.put('/menu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;
        
        if (!name && description === undefined && price === undefined) {
            return res.status(400).json({ error: 'At least one field must be provided for update' });
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(
            id,
            { name, description, price },
            { new: true, runValidators: true }
        );
        
        if (!updatedItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.status(200).json({ message: 'Menu item updated successfully', item: updatedItem });
    } catch (error) {
        res.status(500).json({ error: 'Error updating menu item', details: error.message });
    }
});

app.delete('/menu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await MenuItem.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting menu item', details: error.message });
    }
});

app.use(express.static('static'));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});