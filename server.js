const PORT = 3500;
const fileStorage = [];

const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');

const isMultipleFiles = (files) => {
    return Array.isArray(files);
}

const main = () => {
    const app = express();
    app.use(fileUpload());
    app.use('/', express.static(path.join(__dirname, '/public')));

    app.get('/filelist', (req, res) => {
        const fileNames = [];
        for (let i = 0; i < fileStorage.length; i++)
            fileNames.push(fileStorage[i].name);
        res.json({files: fileNames})
    });

    app.get('/files/:name', (req, res) => {
        const fileName = req.params["name"]
        for (let i = 0; i < fileStorage.length; i++) {
            if (fileName === fileStorage[i].name) {
                res.status(200).send(fileStorage[i].data);
                return
            }
        }
        res.status(404).json({msg: "file not found"});
    });

    app.post('/upload', (req, res) => {
        if (req.files === null)
            res.status(400).redirect('/');
        if (!isMultipleFiles) {
            const file = req.files.files
            fileStorage.push({
                name: file.name,
                data: file.data,
            })
        } else {
            const files = req.files.files
            for (let i in files) {
                const file = files[i];
                fileStorage.push({
                    name: file.name,
                    data: file.data,
                })
            }
        }
        res.status(200).redirect('/');
    })

    app.post('/clear', (req, res) => {
        fileStorage.splice(0, fileStorage.length);
        res.status(200).json({msg: "files cleared successfully"})
    })

    app.listen(PORT, () => {
        console.log('Server started on port', PORT)
    })
}

main();
