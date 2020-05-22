const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const multer = require('multer')
const { TesseractWorker } = require('tesseract.js')
const worker = new TesseractWorker()
const PORT = process.env.PORT || 3000

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

const upload = multer({ storage }).single('avatar')

app.use(express.static(__dirname + '/public'));
app.set('view engine', "ejs")

//routes
app.get('/', (request, response) => {
    response.render('home')
})

app.post('/getText', (request, response) => {
    upload(request, response, err => {
        if (err) {
            console.log(err)
            return response.end('err upload')
        }

        if (!request.file)
            return response.status(500).end('error missing file')
        const filePath = `uploads/${request.file.originalname}`
        fs.readFile(filePath, (err, data) => {
            if (err) return response.status(500).send('error in reading')
            // worker
            //     .recognize(data)
            //     // .progress(prog => {
            //     //     console.log(prog)
            //     // })
            //     .then(result => {
            //         return response.send(result.text)
            //     }).catch(err => {
            //         console.log(err)
            //         response.status(500).send('error in recon')
            //     })
            //     .finally(() => clearAll(null))
        })
    })
})

app.post('/download', (request, response) => {
    upload(request, response, err => {
        const filePath = `uploads/${request.file.originalname}`
        const newFileName = request.file.originalname.split('.')[0] + '_to_pdf_' + Date.now()
        fs.readFile(filePath, (err, data) => {
            if (err) return response.status(500).send('error in reading')
            worker
                .recognize(data, "eng", { tessjs_create_pdf: "1", tessjs_pdf_name: newFileName })
                // .progress(prog => {
                //     console.log(prog)
                // })
                .then(result => {
                    const fileTodownloadPath = `${__dirname}/${newFileName}.pdf`
                    return response.download(fileTodownloadPath)
                }).catch(err => {
                    console.log(err)
                    response.status(500).send('error in recon')
                })
                .finally(() => clearAll(`${__dirname}/${newFileName}.pdf`))
        })
    })
})

function clearAll(pathNewFile) {
    worker.terminate()
    const directory = 'uploads'
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        if (pathNewFile)
            fs.unlink(pathNewFile, err => {
                if (err) throw err;
            });
        for (const file of files) {
            if (file.split('plac').length == 1)
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
        }
    });
}

app.listen(PORT, () => console.log(`server running on ${PORT}`))

