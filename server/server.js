const express = require("express");
const path = require("path");
const Store = require("./model/Store");

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
    //Error would be handled by below route after redirect
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

  // Read OG image of url
  app.get("/api/og-image", async (req, res) => {
    //Reg ex replace everything after characther https://stackoverflow.com/questions/34437987/regex-for-replacing-everything-after-instance-of-a-character
    const url = "https://" + req.query.url.replace(/\/.*/, "");
    const html = await fetch(url).then((r) => r.text());

    // Stackoverflow regex for og:image https://stackoverflow.com/questions/60588035/find-the-content-of-meta-tag-using-regular-expression
    const image1 = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)/i);
    const image2 = html.match(/content=["']([^"']+)["'][^>]*property=["']og:image/i);

    if (image1) return res.json({ image: image1[1] });
    if (image2) return res.json({ image: image2[1] });

    res.json({ image: null });
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
    const cookies = req.headers.cookie || "";
    if (cookies.includes("admin=true")) {
      res.sendFile(path.join(__dirname, "../client/admin.html"));
    } else {
      res.redirect("/login");
    }
  });

  // Login routes
  app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/login.html"));
  });

  app.post("/login", express.urlencoded({ extended: true }), async (req, res) => {
    const { username, password } = req.body;
    const isValid = await Store.verifyAdmin(username, password);
    if (isValid) {
      res.setHeader("Set-Cookie", "admin=true; HttpOnly; Path=/");
      res.redirect("/admin");
    } else {
      res.status(401).send("Invalid credentials. <a href='/login'>Try again</a>");
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
