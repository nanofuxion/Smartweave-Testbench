import * as path from "path";
import express from "express";
import * as bodyParser from 'body-parser';
import * as fsExtra from 'fs-extra';
import * as formidable from 'formidable';
import { base, addState, addCont, handler } from './src/coordinator';
import { makeid } from './src/generator';
const { Server } = require("socket.io");
import exphbs from 'express-handlebars';
import * as FLATTED from 'flatted';
const app = express();
const PORT: number = 8000;

//store contracts and state files locally then delete on restart
let uploadsDir = path.join(__dirname, "../uploads");
fsExtra.emptyDir(uploadsDir)
  .then(() => console.log('temp uploads directory reset!'));

app.use(express.static('public'))

//Object variable that stores all contract string and state objects.
let instance = base;

// set up socket.io and bind it to our http server. for the gui
let http = require("http").Server(app);
const io = new Server(http);

//Placeholders 
let txid = [];
let logs = [];

//Object used to pass console.log + web gui logs at the same time.
let soc = {
  log: (...log) => { },
  txid: (name: string, id: string) => { },
  state: (state) => { } //Reference line 53
}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  soc.log = (...log) => {
    logs.unshift(...log)
    console.log(...log)
    io.emit('log', ...log);
  }
  
  //To do: use to make states refresh on state pages 
  soc.state = (state) => {}
  
  //To do: implement transaction txid
  soc.txid = (name: string, id: string) => {
    io.emit('txid', [`"${name.toLocaleUpperCase()}"`, id]);
    txid.push([`"${name.toLocaleUpperCase()}"`, id]);
  }

  socket.on('input', (json: string, sender: string, tx: string) => {
    console.log(`input received ${json}`)
    let src: string;
    try {
      src = instance.contracts.find(el =>
        el.id == tx).contract
    } catch (error) {
      return soc.log(`Contract ID: ${tx} not found.`)
    }
    let objIndex = instance.states.findIndex((obj => obj.id == tx))

    let slog = (log) => {//Socket + log = soc.log = slog :) 
      soc.log('"' + instance.contracts.find(el =>
        el.id == tx).name.toLocaleUpperCase() + '"' + ": ContractError: " + log)
    }


//Lots of try/catches to prevent overall script from crashing when running handler
    try {
      let handle = handler(src, tx, slog, instance)//pass slog to handler to replace "throw new ContractError"
      let action = { caller: sender, input: JSON.parse(json) }
      let result;

      (async () => {
        try {
          result = await handle(instance.states[objIndex].state, action)
          if (result != {} && result != undefined) soc.log('"' + instance.contracts.find(el =>
            el.id == tx).name.toLocaleUpperCase() + '"' + `: Result:  
            <br><pre class="prettyprint"><code class="language-json">` + JSON.stringify(result, null, 2) + `</code></pre>`)
        } catch (error) {
          result = await handle(instance.states[objIndex].state, action)
          if (result != {} && result != undefined) soc.log('"' + instance.contracts.find(el =>
            el.id == tx).name.toLocaleUpperCase() + '"' + `: Result:  
            <br><pre class="prettyprint"><code class="language-json">` + FLATTED.stringify(result, null, 2) + `</code></pre>`)
        }
      })()

    } catch (error) {
      soc.log("got the following error: ", error.messge)
    }


  });
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


let walletList: any;
(async () => {
  walletList = [
    {id: "a5_du7BfZ3aCqAjVYWROr1uFogvX1O5oN-rMTV3GB1I"},
    { id: await makeid(43) },
    { id: await makeid(43) },
    { id: await makeid(43) },
    { id: await makeid(43) },
  ];
  console.log("Ready")
  soc.log("ready")
})()

app.get('/', function (req, res) {
  res.render('home', {
    wallets: walletList,
    log: logs,
    tx: txid
  });
});

//Display current state a of "X" contract at localhost:${PORT}/state/"X"
app.get('/state/:contract', function (req, res) {
  let stateValue = JSON.stringify(instance.states.find(
    el => el.name.localeCompare(req.params.contract, undefined, { sensitivity: 'accent' }) == 0
  ), null, 2)
  console.log(stateValue)
  res.render('state', { state: [stateValue], name: req.params.contract.toUpperCase() });
});
// Replace for  above with below for pure json results
// app.get('/state/:contract', function (req, res) {
//   res.setHeader('Content-Type', 'application/json');
//   res.end(JSON.stringify(instance.states.find(el => el.name == req.params.contract)))
//   // res.json(req.params)
// });

let fileExist = [],
  count = {},
  name: string;
  
//Receive contract and state files parse and add to instance
app.post('/contracts', async function (req, res) {
  let form = new formidable.IncomingForm(),
    files = [],
    addr = await makeid(43);
  form.uploadDir = uploadsDir;
  //Find files with the same name and add them to a new object in instance 
  form.on('file', function (field, file) {
    name = file.name.split('.').slice(0, -1).join('.')

    fileExist.forEach(function (i) { count[i] = (count[i] || 0) + 1; });
    if (count[name] > 1 && count[name] != undefined) {
      return;
    }
    if (file.name.endsWith(".json")) {
      let data = JSON.parse(
        fsExtra.readFileSync(file.path, 'utf8')
      )
      instance = addState(name, data, instance, addr) //Add state to instance
    } else {
      let data = fsExtra.readFileSync(file.path, 'utf8')
      instance = addCont(name, data, instance, addr) //Add contract to instance
    }
  });

  //Check if contract with matching name ahs already been added
  form.on('end', function () {
    if (count[name] > 1 && count[name] != undefined) {
      return soc.log(`⚠️⚠️ A contract named "${name.toLocaleUpperCase()}" has already been added! ⚠️⚠️`)
    }
    //If file anme not in fileExist confirm contract added
    fileExist.push(name);
    soc.log(`Added contract "${name.toLocaleUpperCase()}" to SpoofWeave`)
    soc.txid(name, addr)
    res.send('Upload Successful!!');
    name = "";
  });

  form.parse(req);
});

//serve the gui at 
const server = http.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});