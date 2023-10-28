const express = require("express");
const app = express();
const cors = require("cors");
const config = require("../config.json");
const expressListRoutes = require('express-list-routes');


const PORT =  process.env.PORT || config.port;

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors({origin: 'http:/\/\localhost/'}));
app.options('*', cors());

app.use
require('./Handlers/Get-Handler')(app);
require('./Handlers/Post-Handler')(app);

app.listen(PORT, () => console.log("listening on port " + PORT));

expressListRoutes(app._router);