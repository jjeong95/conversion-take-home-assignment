const drawerContainer = document.createElement("div");
drawerContainer.id = "sticky-drawer-container";

const drawerTab = document.createElement("div");
drawerTab.id = "drawer-tab";
drawerTab.innerHTML = `<span class="drawer-tab-title">Sticky drawer</span> <span class="tab-navigation"><button id="prev-page" aria-label="Previous Page">&lt;</button> <span id="page-count">1 / 1</span> <button id="next-page" aria-label="Next Page">&gt;</button></span> <span class="chevron" role="button" aria-label="Toggle Drawer" tabindex="0">&#9650;</span>`;
drawerContainer.appendChild(drawerTab);

const drawerContentWrapper = document.createElement("div");
drawerContentWrapper.id = "drawer-content-wrapper";
drawerContainer.appendChild(drawerContentWrapper);

const drawerContent =
  document.getElementById("drawer-content") || document.createElement("div");
drawerContent.id = "drawer-content";
drawerContent.classList.add("swiper");
drawerContentWrapper.appendChild(drawerContent);

const swiperWrapper = document.createElement("div");
swiperWrapper.classList.add("swiper-wrapper");
drawerContent.appendChild(swiperWrapper);

const loadingMessage = document.createElement("div");
loadingMessage.classList.add("loading-message");
loadingMessage.textContent = "Loading Pokémon data...";
swiperWrapper.appendChild(loadingMessage);

const drawerOverlay =
  document.getElementById("drawer-overlay") || document.createElement("div");
drawerOverlay.id = "drawer-overlay";
if (!drawerOverlay.parentNode) {
  document.body.appendChild(drawerOverlay);
}
if (!drawerContainer.parentNode) {
  document.body.appendChild(drawerContainer);
}

let isDrawerVisible = false;
const chevron = drawerTab.querySelector(".chevron");
const overlay = document.getElementById("drawer-overlay");
let swiperInstance = null;
let swiperLoaded = false;
let slidesPerPage = 4;
let currentPage = 0;
let totalPages = 1;
let pokemonList = [];
let isLoading = false;
let initialLoadComplete = false;

const prevPageButton = drawerTab.querySelector("#prev-page");
const nextPageButton = drawerTab.querySelector("#next-page");
const pageCountDisplay = drawerTab.querySelector("#page-count");

function updateSlidesPerPage() {
  if (window.innerWidth >= 1024) slidesPerPage = 4;
  else if (window.innerWidth >= 768) slidesPerPage = 2;
  else slidesPerPage = 1;
}

function updatePageCount() {
  totalPages =
    pokemonList.length > 0 ? Math.ceil(pokemonList.length / slidesPerPage) : 1;
  currentPage = Math.min(currentPage, totalPages - 1);
  if (currentPage < 0) currentPage = 0;

  pageCountDisplay.textContent = `${currentPage + 1} / ${totalPages}`;
  prevPageButton.disabled = currentPage === 0;
  nextPageButton.disabled = currentPage >= totalPages - 1 || totalPages <= 1;

  const tabNavigation = drawerTab.querySelector(".tab-navigation");
  tabNavigation.style.display = totalPages <= 1 ? "none" : "flex";
}

function formatPokemonTypes(typesArray) {
  if (!typesArray || typesArray.length === 0) {
    return "Type N/A";
  }
  return typesArray
    .map(
      (typeInfo) =>
        typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)
    )
    .join(" / ");
}

async function fetchPokemonList(limit = 20) {
  if (isLoading) return;
  isLoading = true;
  loadingMessage.style.display = "block";
  swiperWrapper.innerHTML = "";
  swiperWrapper.appendChild(loadingMessage);

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}`
    );
    const data = await response.json();
    pokemonList = data.results;
    updateSlidesPerPage();
    await renderPokemonSlides();
    initialLoadComplete = true;
  } catch (error) {
    console.error("Error fetching Pokémon list:", error);
    loadingMessage.style.display = "none";
    swiperWrapper.innerHTML =
      '<div class="swiper-slide">Failed to load Pokémon. Please try again later.</div>';
    pokemonList = [];
  } finally {
    isLoading = false;
    if (pokemonList.length > 0 || !initialLoadComplete || !isLoading)
      loadingMessage.style.display = "none";
    updatePageCount();
    if (swiperInstance && isDrawerVisible) {
      swiperInstance.update();
      swiperInstance.slideTo(0, 0);
      currentPage = 0;
    }
  }
}

async function getPokemonDetails(url) {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Details fetch failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching Pokémon details for " + url + ":", error);
    return null;
  }
}

async function renderPokemonSlides() {
  swiperWrapper.innerHTML = "";
  if (pokemonList.length === 0) {
    if (!isLoading) {
      const emptyState = document.createElement("div");
      emptyState.classList.add("swiper-slide");
      emptyState.textContent = "No Pokémon data available.";
      swiperWrapper.appendChild(emptyState);
    }
    updatePageCount();
    if (swiperInstance) swiperInstance.update();
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const pokemon of pokemonList) {
    const details = await getPokemonDetails(pokemon.url);
    let typeString = "Loading type...";

    if (details) {
      typeString =
        details.types && details.types.length > 0
          ? formatPokemonTypes(details.types)
          : "Type N/A";

      const stats = details.stats
        .map((stat) => `${stat.stat.name.replace("-", " ")}: ${stat.base_stat}`)
        .join("<br>");
      let imageSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAEElEQVR42mP8z8AIMA0CBkKYH/cAAAAASUVORK5CYII=";
      if (details.sprites?.other?.["official-artwork"]?.front_default)
        imageSrc = details.sprites.other["official-artwork"].front_default;
      else if (details.sprites?.other?.["dream-world"]?.front_default)
        imageSrc = details.sprites.other["dream-world"].front_default;
      else if (details.sprites?.front_default)
        imageSrc = details.sprites.front_default;

      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");
      const pokemonNameCapitalized =
        pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
      slide.innerHTML = `
              <h3 class="pokemon-header">
                  <span>${pokemonNameCapitalized}</span>
                  <div class="tooltip-container type-tooltip-trigger-container">
                      <span class="type-tooltip-trigger" aria-label="View Pokémon types">&#9432;</span>
                      <span class="tooltip-text type-tooltip-content">${typeString}</span>
                      <span class="tooltip-arrow"></span>
                  </div>
              </h3>
              <img class="pokemon-image" src="${imageSrc}" alt="${pokemon.name}" loading="lazy">
              <p class="pokemon-description">${stats}</p>
              <div class="tooltip-container">
                  <button class="pokemon-button">View Details</button>
                  <span class="tooltip-text">${pokemonNameCapitalized}</span>
                  <span class="tooltip-arrow"></span>
              </div>
          `;
      fragment.appendChild(slide);
    } else {
      const errorSlide = document.createElement("div");
      errorSlide.classList.add("swiper-slide");
      errorSlide.innerHTML = `<p>Could not load data for ${pokemon.name}</p>`;
      fragment.appendChild(errorSlide);
    }
  }
  swiperWrapper.appendChild(fragment);
  updatePageCount();
  if (swiperInstance) swiperInstance.update();
}

function loadSwiperScript() {
  return new Promise((resolve, reject) => {
    if (swiperLoaded) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/swiper@latest/swiper-bundle.min.js";
    script.onload = () => {
      swiperLoaded = true;
      resolve();
    };
    script.onerror = (err) => {
      console.error("Failed to load Swiper script:", err);
      reject(err);
    };
    document.head.appendChild(script);
  });
}

function closeDrawer() {
  isDrawerVisible = false;
  drawerTab.classList.remove("open");
  drawerContentWrapper.classList.remove("open");
  drawerContent.classList.remove("open");
  overlay.classList.remove("open");
}

async function openDrawer() {
  isDrawerVisible = true;
  drawerTab.classList.add("open");
  drawerContentWrapper.classList.add("open");
  drawerContent.classList.add("open");
  overlay.classList.add("open");

  if (!swiperLoaded) {
    try {
      await loadSwiperScript();
      initializeSwiper();
    } catch (error) {
      swiperWrapper.innerHTML =
        '<div class="swiper-slide">Swiper library failed to load.</div>';
      return;
    }
  } else if (!swiperInstance) initializeSwiper();
  else {
    swiperInstance.enable();
    swiperInstance.update();
  }

  if (!initialLoadComplete && !isLoading) await fetchPokemonList();
  else if (pokemonList.length > 0 && swiperInstance) swiperInstance.update();
  else if (pokemonList.length === 0 && !isLoading) renderPokemonSlides();
}

function toggleDrawer(event) {
  event.stopPropagation();
  if (isDrawerVisible) closeDrawer();
  else openDrawer();
}

function initializeSwiper() {
  if (!swiperLoaded || swiperInstance || typeof Swiper === "undefined") return;
  updateSlidesPerPage();
  swiperInstance = new Swiper(".swiper", {
    slidesPerView: slidesPerPage,
    slidesPerGroup: slidesPerPage,
    spaceBetween: 15,
    loop: false,
    allowTouchMove: true,
    navigation: { enabled: false },
    pagination: { enabled: false },
    initialSlide: currentPage * slidesPerPage,
    on: {
      slideChange: function () {
        currentPage = Math.floor(this.realIndex / slidesPerPage);
        if (currentPage < 0) currentPage = 0;
        updatePageCount();
      },
      resize: function () {
        updateSlidesPerPage();
        this.params.slidesPerView = slidesPerPage;
        this.params.slidesPerGroup = slidesPerPage;
        this.update();
        this.slideTo(currentPage * slidesPerPage, 0, false);
        updatePageCount();
      },
    },
  });
  updatePageCount();
}

function navigatePage(direction) {
  if (!swiperInstance || isLoading) return;
  const newPage = currentPage + direction;
  if (newPage >= 0 && newPage < totalPages) {
    currentPage = newPage;
    swiperInstance.slideTo(currentPage * slidesPerPage, 300);
    updatePageCount();
  }
}

fetchPokemonList();

chevron.addEventListener("click", toggleDrawer);
chevron.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleDrawer(e);
  }
});
overlay.addEventListener("click", closeDrawer);
prevPageButton.addEventListener("click", (e) => {
  e.stopPropagation();
  navigatePage(-1);
});
nextPageButton.addEventListener("click", (e) => {
  e.stopPropagation();
  navigatePage(1);
});

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (isDrawerVisible && swiperInstance && swiperLoaded) updatePageCount();
    else updateSlidesPerPage();
  }, 250);
});

window.addEventListener("scroll", () => {
  if (
    isDrawerVisible &&
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 10
  ) {
    closeDrawer();
  }
});

updateSlidesPerPage();
updatePageCount();
