const express = require("express")
const router = express.Router()
const urlController = require("../Controller/urlController")
require("dotenv").config()

router.post("/url/shorten", urlController.urlShortener)

router.get("/:urlCode", urlController.getUrl)


module.exports = router