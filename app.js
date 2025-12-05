require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


app.get('/todo/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
        const json = await response.json();
        res.json(json);
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
const Vault = require('./models/Vault');

// GET /search?keyword=abc
app.get('/search', async (req, res) => {
  const keyword = req.query.keyword || '';
  const results = await Vault.find({
    name: { $regex: keyword, $options: 'i' }  // case-insensitive
  });
  res.json(results);
});
// GET /sort?field=name&order=asc
app.get('/sort', async (req, res) => {
  const field = req.query.field || 'name';
  const order = req.query.order === 'desc' ? -1 : 1;
  const results = await Vault.find().sort({ [field]: order });
  res.json(results);
});
//Export Vault Data
const fs = require('fs');
const path = require('path');

app.get('/export', async (req, res) => {
  const data = await Vault.find();
  const now = new Date().toISOString();
  const fileName = `export_${now}.txt`;
  const filePath = path.join(__dirname, fileName);

  let fileContent = `Exported on ${now}\n\n`;
  data.forEach(record => {
    fileContent += `${record.name} | ${record.id} | ${record.date}\n`;
  });

  fs.writeFileSync(filePath, fileContent);
  res.download(filePath);
});
//Automatic Backup
const backupVault = async () => {
  const data = await Vault.find();
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
  fs.writeFileSync(
    path.join(backupDir, `backup_${timestamp}.json`),
    JSON.stringify(data, null, 2)
  );
};

// POST /add
app.post('/add', async (req, res) => {
  const vault = new Vault(req.body);
  await vault.save();
  await backupVault();
  res.json({ message: 'Record added and backup created' });
});

// DELETE /delete/:id
app.delete('/delete/:id', async (req, res) => {
  await Vault.findByIdAndDelete(req.params.id);
  await backupVault();
  res.json({ message: 'Record deleted and backup created' });
});
//Vault Statistics
app.get('/stats', async (req, res) => {
  const data = await Vault.find();
  const total = data.length;
  const lastModified = data.sort((a,b) => b.updatedAt - a.updatedAt)[0]?.updatedAt;
  const longestName = data.sort((a,b) => b.name.length - a.name.length)[0]?.name;
  const earliestDate = data.sort((a,b) => a.date - b.date)[0]?.date;
  const latestDate = data.sort((a,b) => b.date - a.date)[0]?.date;

  res.json({ total, lastModified, longestName, earliestDate, latestDate });
});

