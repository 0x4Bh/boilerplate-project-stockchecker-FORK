const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("1. Viewing one stock: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .get("/api/stock-prices")
      .set("content-type", "application/json")
      .query({ stock: "A" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.property(res.body, "stockData");
        assert.property(res.body.stockData, "stock");
        assert.equal(res.body.stockData.stock, "A");
        assert.property(res.body.stockData, "price");
        assert.exists(res.body.stockData.price);
        assert.property(res.body.stockData, "likes");
        done();
      });
  });

  let likeAmount = 0;
  test("2. Viewing one stock and liking it: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .get("/api/stock-prices")
      .set("content-type", "application/json")
      .query({ stock: "A", like: "true" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.property(res.body, "stockData");
        assert.property(res.body.stockData, "stock");
        assert.equal(res.body.stockData.stock, "A");
        assert.property(res.body.stockData, "price");
        assert.exists(res.body.stockData.price);
        assert.property(res.body.stockData, "likes");
        assert.isAbove(res.body.stockData.likes, 0);
        likeAmount = res.body.stockData.likes;
        done();
      });
  });
  test("3. Viewing the same stock and liking it again: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .get("/api/stock-prices")
      .set("content-type", "application/json")
      .query({ stock: "A", like: "true" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.property(res.body, "stockData");
        assert.property(res.body.stockData, "stock");
        assert.equal(res.body.stockData.stock, "A");
        assert.property(res.body.stockData, "price");
        assert.exists(res.body.stockData.price);
        assert.property(res.body.stockData, "likes");
        assert.equal(res.body.stockData.likes, likeAmount);
        done();
      });
  });

  let relLikesMSFT = 0;
  let relLikesAAPL = 0;
  let difference = 0;
  test("4. Viewing two stocks: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .get("/api/stock-prices?stock=msft&stock=aapl")
      .set("content-type", "application/json")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.property(res.body, "stockData");
        assert.isArray(res.body.stockData);
        res.body.stockData.forEach((stockItem) => {
          assert.property(stockItem, "stock");
          assert.oneOf(stockItem.stock, ["msft", "aapl"]);
          assert.property(stockItem, "price");
          assert.exists(stockItem.price);
          assert.property(stockItem, "rel_likes");
          assert.exists(stockItem.rel_likes);
        });
        relLikesMSFT = res.body.stockData[0].rel_likes;
        relLikesAAPL = res.body.stockData[1].rel_likes;
        difference = relLikesMSFT - relLikesAAPL;
        done();
      });
  });
  test("5. Viewing two stocks and liking them: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .get("/api/stock-prices?stock=msft&stock=aapl&like=true")
      .set("content-type", "application/json")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.property(res.body, "stockData");
        assert.isArray(res.body.stockData);
        res.body.stockData.forEach((stockItem) => {
          assert.property(stockItem, "stock");
          assert.oneOf(stockItem.stock, ["msft", "aapl"]);
          assert.property(stockItem, "price");
          assert.exists(stockItem.price);
          assert.property(stockItem, "rel_likes");
          assert.exists(stockItem.rel_likes);
        });
        assert.equal(
          res.body.stockData[0].rel_likes - res.body.stockData[1].rel_likes,
          difference
        );
        done();
      });
  });
});
