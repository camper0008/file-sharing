const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const PORT = 3500;

app.use('/', express.static(__dirname + '/user_files'))
app.use(fileUpload());

const fs = require('fs');
const path = require('path');

app.get('/', (req, res) => {
    fs.readdir('./user_files', (err, data) => {
        if (err) throw err;
        let dataString = ''
        for (fileIndex in data) {
            if (data[fileIndex] !== '.gitkeep') dataString += `<li><a href='${data[fileIndex]}'>${data[fileIndex]}</a></li>`
        }
        res.send(/*html*/`
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <style>
                input, ul {
                    font-size: 1.05rem;
                    font-family: Arial, sans-serif;
                }
            </style>
        </head>
        <body>
            <h1>Upload files</h1>
            <form enctype='multipart/form-data' action='/upload' method='POST'>
                <input name='files' type='file' multiple>
                <br><br>
                <input name='submit' type='submit' value='Upload'>
            </form>
            <br>
            <form enctype='multipart/form-data' action='/clear' method='POST'>
                <input name='submit' type='submit' value='Clear Files'>
            </form>
            <br>
            <ul>
                ${dataString}
            </ul>
        </body>
        </html>`
        )
    })
})

app.post('/upload', (req, res) => {
    if (req.files.files.mv) {
        let file = req.files.files
        file.mv(path.join(__dirname, '/user_files/', file.name));
    } else if (req.files) {
        let files = req.files.files
        for (file in files) {
            files[file].mv(path.join(__dirname, '/user_files/', files[file].name));
        }
    }
    res.redirect('/');
})
app.post('/clear', (req, res) => {

    fs.readdir('./user_files', (err, data) => {
        if (err) throw err;
        for (fileIndex in data) {
            if (data[fileIndex] !== '.gitkeep') fs.unlink(path.join(__dirname, '/user_files/', data[fileIndex]), (err) => {
                if (err) throw err;
            });
        }
    });
    res.redirect('/');
})

app.listen(PORT, () => {
    console.log('Server started on port', PORT)
})