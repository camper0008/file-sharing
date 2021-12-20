const express = require('express');
const fileUpload = require('express-fileupload');
const { join } = require('path');
const { rm, mkdir, readdir, readFile, writeFile } = require('fs/promises');

const folderPath = () => join(__dirname, './file_storage')

const filePath = (filename) => join(folderPath(), `./${filename}`);

const isMultipleFiles = (files) => Array.isArray(files);

const createFolder = async () => {
    try {
        console.log("Could not find folder, attempting to create folder.");
        await mkdir(folderPath());
        console.log("Folder created.");
    } catch {
        console.log("Something went wrong creating file_storage folder.");
    }
}

const checkFolder = async () => {
    try {
        console.log("Attempting to see if file_storage folder exists.");
        await readdir(folderPath());
        console.log("Folder exists.");
    } catch {
        await createFolder();
    }
}

const getFileListHandler = async (req, res) => {
    const files = await readdir(folderPath())
    res.json({files})
}

const getFileByNameHandler = async (req, res) => {
    const fileName = req.params["name"];
    try {
        const bytes = await readFile(filePath(fileName));
        res.status(200).send(bytes);
    } catch (err) {
        res.status(500).send("Something went wrong reading file.")
    }
}

const uploadHandler = async (req, res) => {
    if (req.files === null)
        res.status(400).redirect('/');

    if (isMultipleFiles(req.files.files)) {
        const fileArray = req.files.files
        for (let i in fileArray) {
            const file = fileArray[i];
            await writeFile(filePath(file.name), file.data);
        }
    } else {
        const file = req.files.files
        await writeFile(filePath(file.name), file.data);
    }

    res.status(200).redirect('/');
}

const clearHandler = async (req, res) => {
    const files = await readdir(folderPath())
    for (let i = 0; i < files.length; i++) {
        rm(filePath(files[i]));
    }
    res.status(200).json({msg: "files cleared successfully"})
}

const runApp = () => {
    const PORT = 3500;

    const app = express();
    app.use(fileUpload());
    app.use('/', express.static(join(__dirname, '/public')));

    app.get('/api/filelist', getFileListHandler);
    app.get('/api/files/:name', getFileByNameHandler);
    app.post('/api/upload', uploadHandler);
    app.post('/api/clear', clearHandler);

    app.listen(PORT, () => console.log('Server started on port', PORT));
}

const main = async () => {
    await checkFolder();

    runApp();
}

main();
