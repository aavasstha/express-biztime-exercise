/** Server startup for BizTime. */


const app = require("./app");
const db = require("./db")

app.listen(3000, function () {
  console.log("Listening on 3000");
});

db.connect();