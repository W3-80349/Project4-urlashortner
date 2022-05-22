
const shortid = require("shortid")
const urlModel = require("../Model/urlModel")
const redis = require("redis");
const { promisify } = require("util");
const validUrl = require("valid-url");


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


const  urlShortener  = async function (req, res) {
    try {
        const bodyData = req.body;
       
        if (Object.keys(bodyData).length == 0)
            return res.status(400).send({ status: false, message: "Enter Data in Body" });


        if (!validUrl.isUri(bodyData.longUrl))
            return res.status(400).send({ status: false, message: "Enter valid url" });
        
        let cacheUrl = await GET_ASYNC(`${bodyData.longUrl}`);
        if (cacheUrl) {
            return res.status(200).send({ status: true,message:"From cache", data: JSON.parse(cacheUrl) })
        } else {
        
            const existUrl = await urlModel.findOne({ longUrl: bodyData.longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1 });
            if (existUrl) {
        
                await SET_ASYNC(`${bodyData.longUrl}`, JSON.stringify(existUrl));
                return res.status(200).send({ status: true, data: data })
            }
        }
        bodyData.urlCode = shortid.generate().toLowerCase() 
        bodyData.shortUrl = "http://localhost:3000/" + bodyData.urlCode;  
  
        const urlDoc = await urlModel.create(bodyData);
        let data = {
            longUrl: urlDoc.longUrl,
            shortUrl: urlDoc.shortUrl,
            urlCode: urlDoc.urlCode
        }
        await SET_ASYNC(`${bodyData.longUrl}`, JSON.stringify(data));
        res.status(201).send({ status: true, data: data })
    }

    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};



const getUrl = async (req, res) => {

    const { urlCode } = req.params
    console.log(urlCode);

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
        const urlDoc = await urlModel.findOne({urlCode : req.params.urlCode })

        if (!urlDoc) {
            return res.status(404).send({ status: false, message: "No doc found in Db with given urlCode" })
        }
        if (!urlDoc.longUrl) {
            return res.status(404).send({ status: false, message: "Long-url is empty" })
        }
        await SET_ASYNC(`${urlCode}`, JSON.stringify(urlDoc.longUrl));
        await SET_ASYNC(urlCode, urlDoc.longUrl);
        console.log("redies not woked");

        return res.status(301).redirect(urlDoc.longUrl)
    }

}

module.exports = { urlShortener, getUrl }

