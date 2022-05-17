const shortid = require("shortid")
const urlModel = require("../Model/urlModel")
const validator = require("../Validator/Validator")


const urlShortener = async (req, res) => {
    try {
        const { longURL } = req.body
        const baseURL = "http://localhost:3000"
        
        if(!validator.isValid(longURL)){
            res.status(400).send({status:false, message:"should not be empty"})
        }
        if(!validator.isRequestBodyEmpty(req.body)){
            res.status(400).send({status:false, message:"req body should not be empty"})
        }
        if(!validator.isValidUrl(longURL)){
            res.status(400).send({status:false, message:"Not a valid url"})
        }

        const urlCode = shortid.generate().toLowerCase() 
        const shortURL = baseURL + "/" + urlCode
        
        const resultObj = {
            longUrl:longURL,
            shortURL: shortURL,
            urlCode:urlCode
        }

        const newUrlDoc = await urlModel.create(resultObj)

        if(!newUrlDoc){
            res.status(400).send({status:false, message:"No url doc is created in DB"})
        }

        res.status(201).send({status:true, data:newUrlDoc})
        
        
    } catch (error) {
        res.status(500).send({error:error.message})
    }
}

const getUrl = async (req, res) => {
    const {urlCode} = req.params

}

module.exports = { urlShortener, getUrl }