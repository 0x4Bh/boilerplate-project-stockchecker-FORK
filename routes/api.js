"use strict";

const axios = require("axios");

const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const mySecret = process.env.DB;
mongoose.connect(mySecret, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "stockchecker",
});

const ipLikeSchema = new mongoose.Schema({
  ip: { type: String },
  symbol: { type: String },
});
ipLikeSchema.index({ ip: 1, symbol: 1 }, { unique: true });
const IPLikeModel = mongoose.model("ip", ipLikeSchema);

module.exports = function (app) {
  app.route("/api/stock-prices").get(async function (req, res) {
    let reqIP = req.ip;
    const { stock, like } = req.query;
    let [stock1, stock2] = Array.isArray(stock)
      ? [...stock]
      : [stock, undefined];

    // ////////
    // reqIP = "155.155.155.0"
    ///////

    if (like == "true") {
      let newIpLike1 = new IPLikeModel({ ip: reqIP, symbol: stock1 });
      try {
        await newIpLike1.save();
      } catch (error) {
        console.log("stock1 duplicate");
      }

      let newIpLike2 = {};
      if (stock2) {
        newIpLike2 = new IPLikeModel({ ip: reqIP, symbol: stock2 });
        try {
          await newIpLike2.save();
        } catch (error) {
          console.log("stock2 duplicate");
        }
      }
    }

    const urls = [];
    urls[0] = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock1}/quote`;
    if (stock2) {
      urls[1] = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock2}/quote`;
    }

    const prices = [];
    for (let urlItem of urls) {
      await axios({
        method: "get",
        url: urlItem,
      }).then((apiResp) => {
        prices.push(apiResp.data.latestPrice);
      });
    }

    const likes1 = await IPLikeModel.countDocuments({ symbol: stock1 }).exec();
    if (stock2) {
      const likes2 = await IPLikeModel.countDocuments({
        symbol: stock2,
      }).exec();
      const stockObj1 = {
        stock: stock1,
        price: prices[0],
        rel_likes: likes1 - likes2,
      };
      const stockObj2 = {
        stock: stock2,
        price: prices[1],
        rel_likes: likes2 - likes1,
      };
      return res.json({ stockData: [stockObj1, stockObj2] });
    } else {
      return res.json({
        stockData: { stock: stock1, price: prices[0], likes: likes1 },
      });
    }
  });
};
