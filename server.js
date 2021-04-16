const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

app.use('/', express.static(__dirname + '/user_files'))
app.use(fileUpload());

const fs = require('fs');

app.get('/', (req, res) => {
    fs.readdir('./user_files', (err, data) => {
        if (err) throw err;
        let dataString = ""
        for (fileName in data) {
            dataString += `<li><a href="${data[fileName]}">${data[fileName]}</a></li>`
        }
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <body>
            <h1>Upload files</h1>
            <form enctype="multipart/form-data" action="/upload" method="POST">
                <input name="files" type="file" multiple><br>
                <input name="submit" type="submit" value="Upload">
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
    if (req.files && req.files.mv) {
        req.files[0].mv(__dirname + "/user_files/" + req.files[0].name);
    } else if (req.files) {
        let files = req.files.files
        for (file in files) {
            files[file].mv(__dirname + "/user_files/" + files[file].name);
        }
    }
    res.send(`<script>window.location.replace('/')</script>`)
})

app.listen(3500, () => {
    console.log(`Server started on port 3500.`)
})