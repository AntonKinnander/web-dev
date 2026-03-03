// Import the Express framework (used to create a web server and API routes),
// path imports node,js which handle files,
//app creates express app
const express = require("express");
const path = require("path");
const app = express();
const PORT = 3005;

//Still cant load a specific store
const stores = require("../client/assets/stores.json");

// Serve static files from the client directory, serves JS, CSS and HTML
app.use(express.static(path.join(__dirname, "../client")));

app.use("/", express.static("public"));

//Serve stores.json
app.get("/stores", (req, res) => {
  res.json(stores);
});

// Serve the store.html for /store/:slug URLs
app.get("/store/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/store.html"));
});

//Random store (in header)
app.get("/random", (req, res) => {
  const storeID = Math.floor(Math.random() * stores.length);
  const store = stores[storeID];
  // https://www.geeksforgeeks.org/web-tech/express-js-res-redirect-function/ Express reirect info
  res.redirect(`/store/${store.slug}`);
});

//To show specific store pages Borde vi ändra och lägga in slug utan svenska tecken så urln blir /ahlens istället för /åhlens?
//Test with slugs
app.get("/stores/:slug", (req, res) => {
  const slug = req.params.slug.toLowerCase();
  const store = stores.find((store) => store.slug.toLowerCase() === slug);
  res.json(store);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
