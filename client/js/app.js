// Wait until the HTML page is loaded
document.addEventListener("DOMContentLoaded", () => {
  //Fetches all stores from the server for index.html
  const list = document.getElementById("stores");
  if (list) {
    fetch("/stores")
      .then((res) => res.json())
      .then((data) => {
        data.forEach((store) => {
          const li = document.createElement("li");

          li.innerHTML = `
            <h2>${store.name}</h2>
            <a href="/store/${store.slug}">Visit</a>
            <hr>
          `;

          list.appendChild(li);
        });
      })
      .catch((err) => console.error("Error", err));
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
        div.innerHTML = `
          <h2>${store.name}</h2>
          <p>${store.description}</p>
          <a href="http://${store.url}" target="_blank">Visit ${store.name}</a>
        `;
      })
      .catch((err) => console.error("Error loading store:", err));
  }
});
