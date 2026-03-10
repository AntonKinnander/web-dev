// Wait until the HTML page is loaded
document.addEventListener("DOMContentLoaded", () => {
  //Stores array to hold data for sorting
  let allStores = [];
  //Current sorting state
  let currentSort = { field: null, direction: 1 };

  //Fetches all stores from the server for index.html
  const list = document.getElementById("stores");
  if (list) {
    fetch("/stores")
      .then((res) => res.json())
      .then((data) => {
        allStores = data;
        //Sorts array initially by name
        sortStores("name");
      })
      .catch((err) => console.error("Error", err));

    //Sorts stores based on field (name or area)
    function sortStores(field) {
      //Toggles direction if same field, else default to ascending
      if (currentSort.field === field) {
        currentSort.direction *= -1;
      } else {
        currentSort.field = field;
        currentSort.direction = 1;
      }

      //sort the array alphabetically
      allStores.sort((a, b) => {
        const valA = (a[field] || "").toLowerCase();
        const valB = (b[field] || "").toLowerCase();

        if (valA < valB) return -1 * currentSort.direction;
        if (valA > valB) return 1 * currentSort.direction;

        //then sort by name anyway (In case of same area)
        if (field !== "name") {
          const nameA = (a.name || "").toLowerCase();
          const nameB = (b.name || "").toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
        }

        return 0;
      });

      renderStores(allStores);
    }

    //renders stores to the HTML list
    function renderStores(stores) {
      list.innerHTML = "";

      stores.forEach((store) => {
        const li = document.createElement("li");

        // If null will say unknown area
        li.innerHTML = `
          <h2>${store.name}</h2>
          <h3>${store.district || "Unknown Area"}</h3>
          <a href="/store/${store.slug}">Visit</a>
          <hr>
        `;

        list.appendChild(li);
      });
    }

    //Event listeners for sorting buttons
    const sortNameBtn = document.getElementById("sortNameBtn");
    if (sortNameBtn) {
      sortNameBtn.addEventListener("click", () => sortStores("name"));
    }

    const sortAreaBtn = document.getElementById("sortAreaBtn");
    if (sortAreaBtn) {
      sortAreaBtn.addEventListener("click", () => sortStores("district"));
    }
  }

  //Fetches the store from the server for store.html template
  const div = document.getElementById("store_info");
  if (div) {
    // Extract slug from the URL path
    const pathParts = window.location.pathname.split("/");
    const slug = pathParts[pathParts.length - 1];

    fetch(`/stores/${slug}`)
      .then((res) => res.json())
      .then((store) => {
        // Render initial content with empty image container that will get the opengraph image
        div.innerHTML = `
          <div id="store-image-container"></div>
          <h2>${store.name}</h2>
          <p>${store.description}</p>
          <a href="http://${store.url}" target="_blank">Visit ${store.name}</a>
        `;

        // Fetch oepngraph image if the store has one well if its detected
        if (store.url) {
          fetch(`/api/og-image?url=${encodeURIComponent(store.url)}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.image) {
                const imgContainer = document.getElementById("store-image-container");
                if (imgContainer) {
                  imgContainer.innerHTML = `<img src="${data.image}" alt="${store.name} thumbnail">`;
                }
              }
            });
        }
      });
  }
});
