// server.js but written using fs rather than storing in memory

const PORT = 3500;

const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs/promises');

const folderPath = () => {
    return path.join(__dirname, './file_storage');
}

const filePath = (filename) => {
    const folderAndFilePath = path.join(folderPath(), `./${filename}`);
    return folderAndFilePath;
}

const createFolder = async () => {
    try {
        console.log("Attempting to see if file_storage folder exists.");
        await fs.readdir(folderPath());
        console.log("Folder exists.");
    } catch {
        try {
            console.log("Could not find folder, attempting to create folder.");
            await fs.mkdir(folderPath());
            console.log("Folder created.");
        } catch {
            console.log("Something went wrong creating file_storage folder.");
        }
    }
}

const isMultipleFiles = (files) => {
    return Array.isArray(files);
}

const main = async () => {
    await createFolder();

    const app = express();
    app.use(fileUpload());
    app.use('/', express.static(path.join(__dirname, '/public')));

    app.get('/filelist', async (req, res) => {
        const files = await fs.readdir(folderPath())
        res.json({files})
    });

    app.get('/files/:name', async (req, res) => {
        const fileName = req.params["name"];
        try {
            const bytes = await fs.readFile(filePath(fileName));
            res.status(200).send(bytes);
        } catch (err) {
            res.status(500).send("Something went wrong reading file.")
        }
    });

    app.post('/upload', async (req, res) => {
        if (req.files === null)
            res.status(400).redirect('/');

        if (isMultipleFiles(req.files.files)) {
            const fileArray = req.files.files
            for (let i in fileArray) {
                const file = fileArray[i];
                await fs.writeFile(filePath(file.name), file.data);
            }
        } else {
            const file = req.files.files
            await fs.writeFile(filePath(file.name), file.data);
        }

        res.status(200).redirect('/');
    })

    app.post('/clear', async (req, res) => {
        const files = await fs.readdir(folderPath())
        for (let i = 0; i < files.length; i++) {
            fs.rm(filePath(files[i]));
        }
        res.status(200).json({msg: "files cleared successfully"})
    })

    app.listen(PORT, () => {
        console.log('Server started on port', PORT)
    })
}

main();