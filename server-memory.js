const express = require('express');
const fileUpload = require('express-fileupload');
const { join } = require('path');

const fileStorage = [];

const isMultipleFiles = (files) => Array.isArray(files);

const addFileToMemory = (file) => {
    fileStorage.push({
        name: file.name,
        data: file.data,
    });
}

const getFileListHandler = (req, res) => {
    const fileNames = [];
    for (let i = 0; i < fileStorage.length; i++)
        fileNames.push(fileStorage[i].name);
    res.json({files: fileNames})
}

const getFileByNameHandler = (req, res) => {
    const fileName = req.params["name"];

    for (let i = 0; i < fileStorage.length; i++)
        if (fileName === fileStorage[i].name)
            return res.status(200).send(fileStorage[i].data);

    res.status(404).json({msg: "file not found"});
}

const uploadHandler = (req, res) => {
    if (req.files === null)
        res.status(400).redirect('/');

    const fileOrFileArray = req.files.files;

    if (isMultipleFiles(fileOrFileArray)) {
        const fileArray = fileOrFileArray
        for (let i in fileArray)
            addFileToMemory(fileArray[i]);

    } else {
        const file = fileOrFileArray
        addFileToMemory(file);
    }
    
    res.status(200).redirect('/');
}

const clearHandler = (req, res) => {
    fileStorage.splice(0, fileStorage.length);
    res.status(200).json({msg: "files cleared successfully"})
}

const runApp = () => {
    const PORT = 3500;

    const app = express();
    app.use(fileUpload());
    app.use('/', express.static(join(__dirname, '/public')));

    app.get('/filelist', getFileListHandler);
    app.get('/files/:name', getFileByNameHandler);
    app.post('/upload', uploadHandler);
    app.post('/clear', clearHandler);

    app.listen(PORT, () => console.log('Server started on port', PORT));
}

const main = async () => {
    await checkFolder();

    runApp();
}

main();