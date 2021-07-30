const express = require('express')
var morgan = require('morgan')
var exphbs = require('express-handlebars')
const fs = require('fs')
const path = require('path')
const e = require('express')

var app = express()

var renamer = {
  dirs: [],
  // activeFiles: []
}


app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use('/assets', express.static('assets'))
app.use('/oldnamed', express.static('oldnamed'))

app.use(express.urlencoded({
  extended: true
}))

app.use(morgan('combined'))
const port = 3001

app.post('/rename', (req, res) => {
  const new_fileName = req.body.newname
  const active_page = req.body.active
  const old_fileName = req.body.oldname
  file_extension = path.extname(old_fileName)

  var all_files = fs.readdirSync(path.join(__dirname, 'renamed', active_page))
  console.log(all_files)
  console.log(active_page)

  var counter = 0
  for (const f of all_files) {
    if (f.substr(0, f.lastIndexOf(' ')) === new_fileName) {
      counter += 1
    }
  }

  fs.renameSync(path.join(__dirname, 'oldnamed', active_page, old_fileName), path.join(__dirname, 'renamed', active_page, new_fileName) + " " + counter + file_extension)
  // console.log(`${new_fileName} && ${old_fileName}`)
  res.redirect(302, `/home/${active_page}`)
});

app.get('/rename', (req, res) => {
  res.redirect(302, '/')
})

app.get('/home/:folder', (req, res) => {
  const oldnamed = path.join(__dirname, 'oldnamed', req.params.folder)
  oldname_files = fs.readdirSync(oldnamed)
  var potentialFile = oldname_files[Math.floor(Math.random() * oldname_files.length)]

  res.render('rename', {
    file: {
      name: potentialFile
    },
    active: {
      image: potentialFile,
      page: req.params.folder
    },
    renamer: {
      dirs: renamer.dirs
    },
  })
});

app.get('/', (req, res) => {
  res.redirect(`home/${renamer.dirs[0]['name']}`)
})

app.listen(port, () => {
  const oldnamed = path.join(__dirname, 'oldnamed')
  const renamed = path.join(__dirname, 'renamed')
  fs.readdir(oldnamed, (err, files) => {
    if (err) {
      return console.log('issue with filesystem' + err)
    }

    files.forEach((file) => {
      if (file.startsWith('.')) {
        return
      }
      renamer.dirs.unshift({
        name: file,
        path: path.join(oldnamed, file)
      })
    })
  })
  console.log(`listening at http://localhost:${port}`)
});