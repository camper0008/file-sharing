const PORT = 3500;
const USER_FILES = [];

const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');


const main = () => {
    const app = express();
    app.use(fileUpload());
    app.use('/', express.static(path.join(__dirname, '/public')));

    app.get('/filelist', (req, res) => {
        const filenames = [];
        for (let i = 0; i < USER_FILES.length; i++)
            filenames.push(USER_FILES[i].name);
        res.json({files: filenames})
    });

    app.get('/files/:name', (req, res) => {
        const fileName = req.params["name"]
        for (let i = 0; i < USER_FILES.length; i++) {
            if (fileName === USER_FILES[i].name) {
                res.status(200).send(USER_FILES[i].data);
                return
            }
        }
        res.status(404).json({msg: "file not found"});
    });

    app.post('/upload', (req, res) => {
        if (req.files === null)
            res.status(400).redirect('/');
        if (req.files.files.mv) {
            const file = req.files.files
            USER_FILES.push({
                name: file.name,
                data: file.data,
                mimetype: file.mimetype,
            })
        } else if (req.files) {
            const files = req.files.files
            for (let i in files) {
                const file = files[i];
                USER_FILES.push({
                    name: file.name,
                    data: file.data,
                    mimetype: file.mimetype,
                })
            }
        }
        res.status(200).redirect('/');
    })

    app.post('/clear', (req, res) => {
        USER_FILES.splice(0, USER_FILES.length);
        res.status(200).json({msg: "files cleared successfully"})
    })

    app.listen(PORT, () => {
        console.log('Server started on port', PORT)
    })
}

main();
