const express = require("express");
const path = require("path");
const Store = require("./postgres");

const app = express();
const PORT = 3005;

// Middleware
app.use(express.json());
// Serve static files from the client directory, serves JS, CSS and HTML
app.use(express.static(path.join(__dirname, "../client")));

app.use("/", express.static("public"));

//connect to database
const startServer = async () => {
  await Store.connectDB();

  //Serve stores from DB
  app.get("/stores", async (req, res) => {
    try {
      const stores = await Store.getAllStores();
      res.json(stores);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  // Serve the store.html for /store/:slug URLs
  app.get("/store/:slug", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/store.html"));
  });

  //Random store (in header)
  app.get("/random", async (req, res) => {
    const store = await Store.getRandomStore();
    res.redirect(`/store/${store.slug}`);
  });

  //To show specific store pages Borde vi ändra och lägga in slug utan svenska tecken så urln blir /ahlens istället för /åhlens?
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

  // Admin API routes
  app.get("/api/admin/stores", async (req, res) => {
    try {
      const stores = await Store.getAllStores();
      res.json(stores);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  app.post("/api/admin/stores", async (req, res) => {
    try {
      const store = await Store.createStore(req.body);
      res.status(201).json(store);
    } catch (err) {
      res.status(500).json({ error: "Failed to create store" });
    }
  });

  app.put("/api/admin/stores/:id", async (req, res) => {
    try {
      const store = await Store.updateStore(req.params.id, req.body);
      res.json(store);
    } catch (err) {
      res.status(500).json({ error: "Failed to update store" });
    }
  });

  app.delete("/api/admin/stores/:id", async (req, res) => {
    try {
      await Store.deleteStore(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete store" });
    }
  });

  // Serve admin panel
  app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/admin.html"));
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
