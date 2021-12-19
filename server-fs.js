// server.js but written using fs rather than storing in memory
const express = require('express');
const fileUpload = require('express-fileupload');
const { join } = require('path');
const { mkdir, readdir, readFile, writeFile, rm } = require('fs/promises');

const createFolder = async () => {
    try {
        console.log("Could not find folder, attempting to create folder.");
        await mkdir(folderPath());
        console.log("Folder created.");
    } catch {
        throw new Error("Something went wrong creating file_storage folder.");
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

const isMultipleFiles = (files) => Array.isArray(files);

const folderPath = () => join(__dirname, './file_storage');

const fileList = () => await readdir(folderPath());

const filePath = (filename) => join(folderPath(), `./${filename}`);

const fileByName = (filename) => await readFile(filePath(fileName));

const upload = async (files) => {
    if (isMultipleFiles(files)) {
        const promises = files.map(({name, data}) => writeFile(filePath(name), data));
        return await Promise.all(promises);
    } else {
        const {name, data} = req.files.files
        return await writeFile(filePath(name), data);
    }
}

const clearFolder = async () => {
    const files = await readdir(folderPath())
    const promises = files.map(file => rm(filePath(file)));
    return await Promise.all(promises);
}

const fileListHandler = () =>
async (req, res) => res.json({files: await readdir(folderPath())});

const fileByNameHandler = () =>
async ({params}, res) => {
    try {
        res.status(200).send(await fileByName(params["name"]));
    } catch (err) {
        res.status(500).send("Something went wrong reading file.")
    }
}

const uploadHandler = () =>
async (req, res) => {
    if (req.files === null)
        res.status(400).redirect('/');
    await upload(req.files.files);
    res.status(200).redirect('/');
}

const clearHandler = () =>
async (req, res) => {
    await clearFolder();
    res.status(200).json({msg: "files cleared successfully"});
}

const makeApp = () => {
    const app = express();
    app.use(fileUpload());
    app.get('/filelist', fileListHandler());
    app.get('/files/:name', fileByNameHandler());
    app.get('/upload', uploadHandler());
    app.get('/clear', clearHandler());
    app.use('/', express.static(path.join(__dirname, '/public')));
    return app;
}

class Server {
    constructor (port) {
        this.port = port;
        this.app = makeApp();
        this.server = undefined;
    }
    
    async start() {
        if (this.server !== undefined)
            return new Promise((resolve) => 
                this.server.listen(() => resolve()))
        else
            return new Promise((resolve) => 
                this.server = this.app.listen(port, () => resolve()));
    }
    
    async stop() {
        return new Promise((resolve) => 
            this.server.close(() => resolve()))
    }
}

const main = () => {
    const port = 3500;
    await checkFolder();
    const server = new Server(port);
    await server.start();
    console.log('Server started on port', port);
}

main();
