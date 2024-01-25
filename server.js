
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3001;
const jwt = require('jsonwebtoken');


const url = 'mongodb+srv://tengdana45:lUsfmUpzmcPdRn7k@expensetrackerapp.ckjtpx8.mongodb.net/expensetracker?retryWrites=true&w=majority';


mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', function() {
console.log('Connected to MongoDB');
});


app.use(express.json());

const expenseSchema = new mongoose.Schema({
    description: String,
    amount: Number,
});

const Expense = mongoose.model('Expense', expenseSchema);


const router = express.Router();


router.post('/', async (req, res) => {
    try {
        console.log('Received POST request:', req.body);
        const { description, amount } = req.body;
        const newExpense = new Expense({ description, amount });
        await newExpense.save();
        res.json({ message: 'Expense added successfully' });
    } catch (error) {
        console.error('Error in POST / route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/', async (req, res) => {
    try {
        console.log('Handling GET request to /');

        const expenses = await Expense.find();
        console.log('Retrieved expenses from the database:', expenses); 

        res.json({ expenses });
    } catch (error) {
        console.error('Error in GET / route:', error); 
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const expenseId = req.params.id;
        const { description, amount } = req.body;

     
        const updatedExpense = await Expense.findByIdAndUpdate(
            expenseId,
            { description, amount },
            { new: true } 
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json({ message: 'Expense updated successfully', expense: updatedExpense });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const expenseId = req.params.id;

        
        const deletedExpense = await Expense.findByIdAndRemove(expenseId);

        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.use('/expenses', router);

module.exports = router;

app.listen(3001, () => {
    console.log(`Server is running on port 3001`);
});


const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const secretKey = process.env.JWT_SECRET;

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded; 
    next();
  });
};

app.get('/secure-route', verifyToken, (req, res) => {

  res.json({ message: 'This route is secure!', user: req.user });
});

app.get('/public-route', (req, res) => {
  res.json({ message: 'This route is public!' });
});
























