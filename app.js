const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const routes = require('./routes/indexRoutes');
const sequelize = require('./utils/database');


require('dotenv').config();
const fs = require('fs');



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({credentials: true})); // Adjust the origin as needed
app.use('/api', routes);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


sequelize.sync({force : false}) // Set force to true only for development/testing purposes
.then(() => {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
  });
})
.catch(err => {
  console.error('Error syncing database:', err);
});