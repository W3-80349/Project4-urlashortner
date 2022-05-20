
const shortid = require("shortid")
const urlModel = require("../Model/urlModel")
const validator = require("../Validator/Validator")
const redis = require("redis");
const { promisify } = require("util");


const redisClient = redis.createClient({
    port: 15634,
    host: "redis-15634.c89.us-east-1-3.ec2.cloud.redislabs.com",
}
);
redisClient.auth("5St5sr2DenzJlGPfrdZYCt7y5l8NMKiF", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

redisClient.on("ready", async function () {
    console.log("Connected to Redis and ready to use....");
});

redisClient.on("error", (err) => {
    console.log(err.message);
})

redisClient.on("end", () => {
    console.log("Redies client is disconnected....");
})

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


// const urlShortener = async (req, res) => {
//     try {
//         const { longURL } = req.body
//         const baseURL = "http://localhost:3000"

//         if (!validator.isValid(longURL)) {
//             return res.status(400).send({ status: false, message: "should not be empty" })
//         }
//         if (!validator.isRequestBodyValid(req.body)) {
//             return res.status(400).send({ status: false, message: "req body should not be empty" })
//         }
//         if (!validator.isValidUrl(longURL)) {
//             return res.status(400).send({ status: false, message: "Not a valid url" })
//         }
//         // const alreadyShortned = await validator.isAlreadyShortned(longURL)
//         // console.log(alreadyShortned);
//         // if (alreadyShortned) {
//         //     return res.status(201).send({ status: true, message: "Already Shortned!", data: alreadyShortned })
//         // }

        
    
//         let existUrl = await GET_ASYNC(`${req.longURL}`)
        
//         if (existUrl) {
//             await SET_ASYNC(`${req.longURL}`, JSON.stringify(existUrl))
            
//             return res.status(200).send({ status: true, data: data(existUrl) });
//         }
//         const urlCode = shortid.generate().toLowerCase()
//         console.log(urlCode);
//         const shortURL = baseURL + "/" + urlCode
//         const resultObj = {
//             longURL: longURL,
//             shortURL: shortURL,
//             URLCode: urlCode
//         }

//         const newUrlDoc = await urlModel.create(resultObj)

//         if (!newUrlDoc) {
//             return res.status(400).send({ status: false, message: "No url doc is created in DB" })
//         }

//         await SET_ASYNC(`${longURL}`, JSON.stringify(newUrlDoc));

//         return res.status(201).send({ status: true, data: newUrlDoc })


//     } catch (error) {
//         res.status(500).send({ error: error.message })
//     }
// }

const urlShortener = async (req, res) => {
    try {
        const { longURL } = req.body
        const baseURL = "http://localhost:3000"

        if (!validator.isValid(longURL)) {
            return res.status(400).send({ status: false, message: "should not be empty" })
        }
        if (!validator.isRequestBodyValid(req.body)) {
            return res.status(400).send({ status: false, message: "req body should not be empty" })
        }
        if (!validator.isValidUrl(longURL)) {
            return res.status(400).send({ status: false, message: "Not a valid url" })
        }
        const alreadyShortned = await validator.isAlreadyShortned(longURL)
        console.log(alreadyShortned);
        if (alreadyShortned) {
            return res.status(201).send({ status: true, message: "Already Shortned!", data: alreadyShortned })
        }

        const urlCode = shortid.generate().toLowerCase()
        console.log(urlCode);
        const shortURL = baseURL + "/" + urlCode

        const resultObj = {
            longURL: longURL,
            shortURL: shortURL,
            URLCode: urlCode
        }

        const newUrlDoc = await urlModel.create(resultObj)

        if (!newUrlDoc) {
            return res.status(400).send({ status: false, message: "No url doc is created in DB" })
        }

        return res.status(201).send({ status: true, data: newUrlDoc })


    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}


const getUrl = async (req, res) => {

    const { urlCode } = req.params

    if (Object.keys(req.params).length === 0) {
        return res.status(400).send({ status: false, message: "Error: no prams given" })
    }
    if (!req.params.urlCode) {
        return res.status(400).send({ status: false, message: "InValid Request" })
    }

    const urlCache = await GET_ASYNC(`${urlCode}`)
    if (urlCache) {
        console.log("redis worked");
        return res.status(301).redirect(urlCache)
    }
    else {
        const urlDoc = await urlModel.findOne({ URLCode: req.params.urlCode })

        if (!urlDoc) {
            return res.status(404).send({ status: false, message: "No doc found in Db with given urlCode" })
        }
        if (!urlDoc.longURL) {
            return res.status(404).send({ status: false, message: "LongURL is empty" })
        }
        await SET_ASYNC(urlCode, urlDoc.longURL);
        console.log("redies not woked");

        return res.status(301).redirect(urlDoc.longURL)
    }

}

module.exports = { urlShortener, getUrl }