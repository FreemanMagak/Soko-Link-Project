//menu icon
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navlinks");

menuBtn.addEventListener("click", function(){
    navMenu.classList.toggle("show");
});


const API_URL = "http://localhost:3000";

// Get the HTML elements
const produceForm = document.getElementById("produceForm");
const cropSelect = document.getElementById("crop");
const cropPrice = document.getElementById("cropPrice");
const marketPriceBtn = document.getElementById("marketPriceBtn");
const marketPriceResults = document.getElementById("marketPriceResults");
const marketMessage = document.getElementById("marketMessage");
const formMessage = document.getElementById("formMessage");


// Display the sample market price when a crop is selected.
cropSelect.addEventListener("change", async function () {
    const selectedCrop = cropSelect.value;

    if (!selectedCrop) {
        cropPrice.textContent =
            "Select a crop to view its sample market price.";
        return;
    }

    cropPrice.textContent = "Loading price...";

    try {
        const response = await fetch(`${API_URL}/marketPrices`);

        if (!response.ok) {
            throw new Error("Could not retrieve market prices.");
        }

        const prices = await response.json();

        const crop = prices.find(
            item => item.crop === selectedCrop
        );

        if (crop) {
            cropPrice.textContent =
                `Sample price in ${crop.market}: KSh ${crop.price}/kg`;
        } else {
            cropPrice.textContent =
                "No sample price is available for this crop.";
        }
    } catch (error) {
        cropPrice.textContent =
            "Unable to load prices. Please try again.";
        console.error(error);
    }
});


// Fetch and display all sample market prices.
marketPriceBtn.addEventListener("click", async function () {
    marketMessage.textContent = "Loading market prices...";
    marketPriceResults.replaceChildren();

    try {
        const response = await fetch(`${API_URL}/marketPrices`);

        if (!response.ok) {
            throw new Error("Could not retrieve market prices.");
        }

        const prices = await response.json();

        if (prices.length === 0) {
            marketMessage.textContent =
                "No market prices are available yet.";
            return;
        }

        prices.forEach(function (item) {
            const card = document.createElement("div");
            card.className = "market-price-card";

            const heading = document.createElement("h3");
            heading.textContent = item.crop;

            const location = document.createElement("p");
            location.textContent = `Market: ${item.market}`;

            const price = document.createElement("p");
            price.textContent = `KSh ${item.price}/kg`;

            card.append(heading, location, price);
            marketPriceResults.appendChild(card);
        });

        marketMessage.textContent =
            "Sample market prices loaded successfully.";
    } catch (error) {
        marketMessage.textContent =
            "Could not load prices. Check that the API is running.";
        console.error(error);
    }
});


// Send a new produce listing to the API.
produceForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    formMessage.textContent = "Submitting your listing...";

    const newProduce = {
        name: cropSelect.value,
        location: document.getElementById("location").value.trim(),
        quantity: Number(document.getElementById("quantity").value),
        price: Number(document.getElementById("price").value),
        harvestDate: document.getElementById("harvestDate").value
    };

    if (
        !newProduce.name ||
        !newProduce.location ||
        newProduce.quantity <= 0 ||
        newProduce.price <= 0 ||
        !newProduce.harvestDate
    ) {
        formMessage.textContent =
            "Please complete all fields with valid values.";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/produce`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newProduce)
        });

        if (!response.ok) {
            throw new Error("Listing submission failed.");
        }

        const savedProduce = await response.json();

        formMessage.textContent =
            `Success! Your ${savedProduce.name} listing has been submitted.`;

        produceForm.reset();
        cropPrice.textContent =
            "Select a crop to view its sample market price.";
    } catch (error) {
        formMessage.textContent =
            "Unable to submit your listing. Please try again.";
        console.error(error);
    }
});