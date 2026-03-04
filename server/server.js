const express = require("express");
const path = require("path");
const Store = require("./postgres");

const app = express();
const PORT = 3005;

// Middleware
app.use(express.json());
//Path to serve from
app.use(express.static(path.join(__dirname, "../client")));

app.use("/", express.static("public"));

//connect to database
const startServer = async () => {
  await Store.connectDB();

  //Serve stores from DB
  app.get("/stores", async (req, res) => {
    try {
      const stores = await Store.getAllStores();
      //turns the data into json
      res.json(stores);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  // Serve the store.htmllayout
  app.get("/store/:slug", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/store.html"));
  });

  //Random store (in header)
  app.get("/random", async (req, res) => {
    const store = await Store.getRandomStore();
    res.redirect(`/store/${store.slug}`);
  });

  //To show specific store pages 
  //Test with slugs
  app.get("/stores/:slug", async (req, res) => {
    try {
      const store = await Store.getStoreBySlug(req.params.slug);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.json(store);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch store" });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
