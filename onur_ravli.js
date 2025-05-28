/**
 * @description base product object for the application, this is the base object that will be used to create the product object
 */
const BASE_PRODUCT = {
  id: 0,
  brand: "",
  name: "",
  url: "",
  price: 0,
  original_price: 0,
  img: "",
};

/**
 * @description constants for the application
 */
const constants = {
  API_URL: "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json",
  STORAGE_PREFIX: "product-carousel-case",
};

/**
 * @description utility functions for the application
 */
const utils = {
  /**
   * @description open the product url in a new tab
   * @param {number} productId the ID of the product to click
   * @param {Event} event the click event
   */
  onClickProductCard: (productId, event) => {
    if (event.target.closest(".heart-container")) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const product = utils.localStorage.get(`${constants.STORAGE_PREFIX}:products`).find((product) => product.id === productId);
    if (product) {
      window.open(product.url, "_blank");
    }
  },

  /**
   * @description calculate the discount percentage of a product
   * @param {number} original_price original price of the product
   * @param {number} price price of the product
   * @returns {number}
   */
  calculateDiscountPercentage: (original_price, price) => {
    if (original_price <= 0) {
      return 0;
    }
    return Math.round(((original_price - price) / original_price) * 100);
  },

  /**
   * @description localStorage wrapper
   */
  localStorage: {
    /**
     * @param {string} key the key of the item to set
     * @param {any} value the value of the item to set
     */
    set: (key, value) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    /**
     * @param {string} key the key of the item to get
     * @returns {any} the value of the item
     */
    get: (key) => {
      return JSON.parse(localStorage.getItem(key));
    },
    /**
     * @description clear all items from localStorage
     */
    reset: () => {
      localStorage.clear();
    },
    /**
     * @param {string} key the key of the item to remove
     */
    remove: (key) => {
      localStorage.removeItem(key);
    },
  },

  /**
   * @description fetch products from the API and store them in localStorage
   * @returns {Promise<typeof BASE_PRODUCT[]>} the products
   */
  fetchProducts: async () => {
    if (utils.localStorage.get(`${constants.STORAGE_PREFIX}:products`)) {
      console.debug("products already in localStorage, skipping fetch");
      return utils.localStorage.get(`${constants.STORAGE_PREFIX}:products`);
    }
    console.debug("fetching products from API");
    try {
      const response = await fetch(constants.API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      utils.localStorage.set(`${constants.STORAGE_PREFIX}:products`, data);
      return data;
    } catch {
      console.error("Failed to fetch products");
      return [];
    }
  },

  /**
   * @description toggle the favorite status of a product
   * @param {number} productId the ID of the product to toggle favorite status
   * @param {Event} event the click event
   */
  toggleFavorite: (productId, event) => {
    event.preventDefault();
    event.stopPropagation();
    let favorites = utils.localStorage.get(`${constants.STORAGE_PREFIX}:favorites`) || [];
    const isFavorite = favorites.includes(productId);
    if (isFavorite) {
      console.debug("removing product from favorites", productId);
      favorites = favorites.filter((id) => id !== productId);
    } else {
      console.debug("adding product to favorites", productId);
      favorites.push(productId);
    }
    utils.localStorage.set(`${constants.STORAGE_PREFIX}:favorites`, favorites);
    const heartContainer = document.querySelector(`[data-product-id="${productId}"] .heart-container`);
    if (heartContainer) {
      if (!isFavorite) {
        heartContainer.innerHTML = `
          <div class="heart ng-star-inserted">
            <img src="assets/svg/added-favorite.svg" alt="heart fill" class="heart-icon">
            <img src="assets/svg/added-favorite-hover.svg" alt="heart fill" class="heart-icon hovered">
            <div class="toolbox">
              <div class="toolbox-triangle"></div>
              <span>Listelerimi güncelle</span>
            </div>
          </div>`;
      } else {
        heartContainer.innerHTML = `
          <div class="heart">
            <img id="default-favorite" src="assets/svg/default-favorite.svg" alt="heart" class="heart-icon">
            <img src="assets/svg/default-hover-favorite.svg" alt="heart" class="heart-icon hovered">
          </div>`;
      }
    }
  },

  /**
   * @description show the discount percentage of a product
   * @param {typeof BASE_PRODUCT} product the product to show the discount percentage of
   * @returns {boolean} true if the product has a discount, false otherwise
   */
  showDiscountPercentage: (product) => {
    return product.original_price !== product.price;
  },

  /**
   * @description get the product card for the product
   * @param {typeof BASE_PRODUCT} product the product to get the card for
   * @returns {string} the product card (html)
   */
  getProductCard: (product) => {
    const hasDiscount = utils.showDiscountPercentage(product);
    const discountPercentage = hasDiscount ? utils.calculateDiscountPercentage(product.original_price, product.price) : 0;
    const favorites = utils.localStorage.get(`${constants.STORAGE_PREFIX}:favorites`) || [];
    const isFavorite = favorites.includes(product.id);
    return `
    <div data-product-id="${product.id}" onclick="utils.onClickProductCard(${
      product.id
    }, event)" class="owl-item ng-tns-c125-4 ng-trigger ng-trigger-autoHeight ng-star-inserted active" style="width: 272.5px; margin-right: 20px;">
      <div class="ins-web-smart-recommender-box-item ng-star-inserted" style="">
        <div event-collection="true" class="ins-product-box ins-element-link ins-add-to-cart-wrapper ins-sr-api" data-product-id="${product.id}" ins-product-id="${product.id}">
          <eb-carousel-product-item>
            <div class="product-item">
              <eb-generic-link class="product-item-anchor" event-collection="true">
                <a class="product-item-anchor ng-star-inserted" href="${product.url}" target="_blank">
                  <figure class="product-item__img without-ar ng-star-inserted">
                    <div class="product-item__multiple-badge" style="z-index: 1;">
                      <span class="d-flex flex-column">
                        <img alt="Popular" loading="lazy" src="assets/images/yildiz-urun.png" srcset="assets/images/yildiz-urun@2x.png 2x, assets/images/yildiz-urun@3x.png 3x" class="ng-star-inserted">
                      </span>
                    </div>
                    <span class="d-flex flex-column align-items-start justify-content-end position-absolute bottom-0">
                      <eb-new-product-badge class="mb-3">
                      </eb-new-product-badge>
                    </span>
                    <cx-media alt="Popular" format="product" id="lnkProduct${product.id}" class="is-initialized">
                      <img class="ng-star-inserted lazyloaded" alt="${product.name}" data-src="${product.img}" src="${product.img}">
                    </cx-media>
                  </figure>
                  <div class="product-item-content ng-star-inserted">
                    <eb-generic-link class="product-item-anchor">
                      <a class="product-item-anchor ng-star-inserted" href="${product.url}" target="_blank">
                        <h2 class="product-item__brand ng-star-inserted">
                          <b>${product.brand} -</b>
                          <span>${product.name}</span>
                        </h2>
                        <div class="d-flex mb-2 stars-wrapper align-items-center ng-star-inserted">
                          <cx-star-rating disabled="true" style="--star-fill: 5;">
                            <cx-icon class="star cx-icon fas fa-star ng-star-inserted"></cx-icon>
                            <cx-icon class="star cx-icon fas fa-star ng-star-inserted"></cx-icon>
                            <cx-icon class="star cx-icon fas fa-star ng-star-inserted"></cx-icon>
                            <cx-icon class="star cx-icon fas fa-star ng-star-inserted"></cx-icon>
                            <cx-icon class="star cx-icon fas fa-star ng-star-inserted"></cx-icon>
                          </cx-star-rating>
                          <p class="review-count ng-star-inserted">(${Math.floor(Math.random() * 1000)})</p>
                        </div>
                      </a>
                    </eb-generic-link>
                    <div class="product-item__price">
                      ${
                        hasDiscount
                          ? `
                      <div class="d-flex align-items-center ng-star-inserted">
                        <span class="product-item__old-price ng-star-inserted">${product.original_price} TL</span>
                        <span class="product-item__percent carousel-product-price-percent ml-2 ng-star-inserted">%${discountPercentage} <i class="icon icon-decrease"></i></span>
                      </div>
                      <span class="product-item__new-price discount-product ng-star-inserted">${product.price} TL</span>
                      `
                          : `
                      <div class="d-flex align-items-center ng-star-inserted">
                      </div>
                      <span class="product-item__new-price ng-star-inserted">${product.price} TL</span>
                      `
                      }
                    </div>
                  </div>
                  <div class="product-list-promo ng-star-inserted">
                    <p class="ng-star-inserted">2. Ürüne %50 İndirim</p>
                  </div>
                </a>
              </eb-generic-link>
              <eb-add-to-wish-list>
                <span class="ng-star-inserted" onclick="utils.toggleFavorite(${product.id}, event)">
                  <div class="heart-container">
                    ${
                      isFavorite
                        ? `<div class="heart ng-star-inserted">
                        <img src="assets/svg/added-favorite.svg" alt="heart fill" class="heart-icon">
                        <img src="assets/svg/added-favorite-hover.svg" alt="heart fill" class="heart-icon hovered">
                        <div class="toolbox">
                          <div class="toolbox-triangle"></div>
                          <span>Listelerimi güncelle</span>
                        </div>
                      </div>`
                        : `<div class="heart">
                        <img id="default-favorite" src="assets/svg/default-favorite.svg" alt="heart" class="heart-icon">
                        <img src="assets/svg/default-hover-favorite.svg" alt="heart" class="heart-icon hovered">
                      </div>`
                    }
                  </div>
                </span>
              </eb-add-to-wish-list>
              <div class="product-item-content">
                <div class="product-item__price">
                  <div class="ins-add-to-cart-wrapper" ins-product-id="${product.id}">
                    <eb-add-to-cart buttonclass="close-btn">
                      <form novalidate="" class="ng-untouched ng-pristine ng-valid ng-star-inserted">
                        <button aria-label="Sepete Ekle" id="addToCartBtn" type="submit" class="btn close-btn disable ng-star-inserted">
                          Sepete Ekle
                        </button>
                      </form>
                    </eb-add-to-cart>
                  </div>
                </div>
              </div>
            </div>
          </eb-carousel-product-item>
        </div>
      </div>
    </div>
    `;
  },

  /**
   * @description get all product cards
   * @param {typeof BASE_PRODUCT[]} products the products to get the cards for
   * @returns {string} the product cards (html)
   */
  getAllProductCards: (products) => {
    let html = "";
    products.forEach((product) => {
      html += utils.getProductCard(product);
    });
    return html;
  },

  /**
   * @description initialize draggable carousel functionality
   * @param {HTMLElement} carouselElement the carousel element to make draggable
   */
  initDraggableCarousel: (carouselElement) => {
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let currentIndex = 0;
    const carousel = carouselElement.querySelector(".owl-stage");
    const items = carouselElement.querySelectorAll(".owl-item");
    const itemWidth = items[0].offsetWidth + 20;
    const visibleItems = Math.floor(carouselElement.offsetWidth / itemWidth);
    const maxIndex = items.length - visibleItems;
    carousel.addEventListener("touchstart", touchStart);
    carousel.addEventListener("touchmove", touchMove, { passive: false });
    carousel.addEventListener("touchend", touchEnd);
    carousel.addEventListener("mousedown", touchStart, { passive: false });
    carousel.addEventListener("mousemove", touchMove);
    carousel.addEventListener("mouseup", touchEnd);
    carousel.addEventListener("mouseleave", touchEnd);
    const bannerWrapper = carouselElement.closest(".banner__wrapper");
    const prevButton = bannerWrapper ? bannerWrapper.querySelector(".swiper-prev") : null;
    const nextButton = bannerWrapper ? bannerWrapper.querySelector(".swiper-next") : null;
    function handlePrevClick() {
      if (currentIndex <= 0) {
        currentIndex = maxIndex;
      } else {
        currentIndex--;
      }
      setPositionByIndex(true);
    }
    function handleNextClick() {
      if (currentIndex >= maxIndex) {
        currentIndex = 0;
      } else {
        currentIndex++;
      }
      setPositionByIndex(true);
    }
    if (prevButton && nextButton) {
      prevButton.addEventListener("click", handlePrevClick);
      nextButton.addEventListener("click", handleNextClick);
      prevButton.style.display = "block";
      nextButton.style.display = "block";
    }
    const cleanup = () => {
      carousel.removeEventListener("touchstart", touchStart);
      carousel.removeEventListener("touchmove", touchMove);
      carousel.removeEventListener("touchend", touchEnd);
      carousel.removeEventListener("mousedown", touchStart);
      carousel.removeEventListener("mousemove", touchMove);
      carousel.removeEventListener("mouseup", touchEnd);
      carousel.removeEventListener("mouseleave", touchEnd);
      if (prevButton && nextButton) {
        prevButton.removeEventListener("click", handlePrevClick);
        nextButton.removeEventListener("click", handleNextClick);
      }
    };
    function touchStart(event) {
      if (event.type === "mousedown") {
        event.preventDefault();
      }
      isDragging = true;
      startPos = getPositionX(event);
      animationID = requestAnimationFrame(animation);
      carousel.style.cursor = "grabbing";
    }
    function touchMove(event) {
      if (!isDragging) return;
      if (event.type === "mousemove" && isDragging) {
        event.preventDefault();
      }
      const currentPosition = getPositionX(event);
      currentTranslate = prevTranslate + currentPosition - startPos;
    }
    function touchEnd() {
      isDragging = false;
      cancelAnimationFrame(animationID);
      carousel.style.cursor = "grab";
      const movedBy = currentTranslate - prevTranslate;
      if (Math.abs(movedBy) > 100) {
        if (movedBy < 0) {
          if (currentIndex >= maxIndex) {
            currentIndex = 0;
          } else {
            currentIndex++;
          }
        } else {
          if (currentIndex <= 0) {
            currentIndex = maxIndex;
          } else {
            currentIndex--;
          }
        }
      }
      setPositionByIndex(true);
    }
    function getPositionX(event) {
      return event.type.includes("mouse") ? event.pageX : event.touches[0].clientX;
    }
    function animation() {
      if (isDragging) {
        setSliderPosition();
        requestAnimationFrame(animation);
      }
    }
    function setSliderPosition() {
      carousel.style.transform = `translateX(${currentTranslate}px)`;
    }
    function setPositionByIndex(animate = false) {
      if (animate) {
        carousel.style.transition = "transform 0.3s ease-out";
        requestAnimationFrame(() => {
          currentTranslate = currentIndex * -itemWidth;
          prevTranslate = currentTranslate;
          setSliderPosition();
        });
        setTimeout(() => {
          carousel.style.transition = "none";
        }, 300);
      } else {
        carousel.style.transition = "none";
        currentTranslate = currentIndex * -itemWidth;
        prevTranslate = currentTranslate;
        setSliderPosition();
      }
    }
    setPositionByIndex();
    return cleanup;
  },
};

/**
 * @description main function to initialize the application
 */
(() => {
  const createCarousel = (products) => {
    const html = `
      <eb-product-carousel class="recommended-products">
        <div class="banner">
          <div class="container">
            <eb-carousel-header class="ng-star-inserted">
              <div class="banner__titles">
                <h2 class="title-primary">Beğenebileceğinizi düşündüklerimiz</h2>
              </div>
            </eb-carousel-header>
            <div ebvisibilityobserver="" class="banner__wrapper ins-preview-wrapper-10167 ng-star-inserted">
              <div data-recomended-items="[BYT-S03,MOL-5064001,BAE-70089001,BAE-20030,BYP-SH860G001,BYT-1511,XYZ-M250DS,JOI-S1706DA001,BYP-MULT002,BYT-ST-004,24GHLBUBDY002003,HIP-4201,SIV-098808,BYP-244004,BYT-8625]">
                <owl-carousel-o class="product-list__best-products" _nghost-serverapp-c124="">
                  <div _ngcontent-serverapp-c124="" class="owl-carousel owl-theme owl-loaded owl-responsive owl-drag">
                    <div _ngcontent-serverapp-c124="" class="owl-stage-outer ng-star-inserted">
                      <owl-stage _ngcontent-serverapp-c124="" class="ng-tns-c125-4 ng-star-inserted">
                        <div class="ng-tns-c125-4">
                          <div class="owl-stage ng-tns-c125-4" style="width: 4388px; transform: translate3d(0px, 0px, 0px); transition: 0.25s; overflow-x: auto; display: flex">
                            ${utils.getAllProductCards(products)}
                          </div>
                        </div>
                      </owl-stage>
                    </div>
                  </div>
                </owl-carousel-o>
                <div class="carousel-navigation">
                  <button class="swiper-prev" aria-label="Previous"></button>
                  <button class="swiper-next" aria-label="Next"></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </eb-product-carousel>`;
    return html;
  };

  /**
   * @description insert the carousel into the page
   * @param {typeof BASE_PRODUCT[]} products the products to insert the carousel for
   */
  const insertCarousel = (html) => {
    const pageLayout = document.querySelector("cx-page-layout.EbebekHomepageTemplate");
    if (window.location.pathname !== "/") return;
    let section1_1 = document.querySelector('cx-page-slot[position="Section1_1"]');
    if (!section1_1) {
      section1_1 = document.createElement("cx-page-slot");
      section1_1.setAttribute("position", "Section1_1");
      section1_1.setAttribute("class", "Section1_1 has-components");
    }
    section1_1.innerHTML = html;
    if (pageLayout) {
      const section1 = pageLayout.querySelector('cx-page-slot[position="Section1"]');
      if (section1 && !section1_1.parentNode) {
        console.debug("Section1 element found within page layout, inserting section1_1 before section1");
        section1.parentNode.insertBefore(section1_1, section1.nextSibling);
      } else if (!section1_1.parentNode) {
        console.debug("Section1 element not found within page layout, appending section1_1 to page layout");
        pageLayout.appendChild(section1_1);
      }
    } else {
      console.debug("EbebekHomepageTemplate page layout not found, appending section1_1 to page layout");
      console.warn("EbebekHomepageTemplate page layout not found");
    }
    setTimeout(() => {
      const carouselElement = document.querySelector(".owl-carousel");
      if (carouselElement) {
        utils.initDraggableCarousel(carouselElement);
      }
    }, 0);
  };

  /**
   * @description build the html for the application
   * @param {typeof BASE_PRODUCT[]} products the products to build the html for
   */
  const buildHtml = (products) => {
    const html = createCarousel(products);
    insertCarousel(html);
  };

  /**
   * @description build the css for the application
   */
  const buildCss = () => {
    const css = `
      .recommended-products {
        margin-top: 20px;
      }

      .banner__wrapper {
        position: relative;
        padding: 0 20px;
      }

      .carousel-navigation {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }

      .swiper-prev,
      .swiper-next {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #fff;
        border: 1px solid #e0e0e0;
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s ease;
        pointer-events: auto;
      }

      .swiper-prev {
        left: -20px;
      }

      .swiper-next {
        right: -20px;
      }

      .swiper-prev::before,
      .swiper-next::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-top: 2px solid #333;
        border-right: 2px solid #333;
      }

      .swiper-prev::before {
        transform: translate(-25%, -50%) rotate(-135deg);
      }

      .swiper-next::before {
        transform: translate(-75%, -50%) rotate(45deg);
      }

      .swiper-prev:disabled,
      .swiper-next:disabled,
      .swiper-prev.disabled,
      .swiper-next.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .owl-stage {
        transition: transform 0.3s ease-out;
      }
    `;
    const styleElement = document.createElement("style");
    styleElement.className = "carousel-style";
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
  };

  /**
   * @description register event listeners for the application
   */
  const registerEventListeners = () => {
    let currentPath = window.location.pathname;
    const isHomePage = () => window.location.pathname === "/";
    const cleanupCarousel = () => {
      const carousel = document.querySelector(".owl-carousel");
      if (carousel) {
        carousel.remove();
      }
    };
    const handlePopState = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        if (isHomePage()) {
          const carouselElement = document.querySelector(".owl-carousel");
          if (carouselElement) {
            utils.initDraggableCarousel(carouselElement);
          }
        } else {
          cleanupCarousel();
        }
        const section = document.querySelector(".section1_1");
        if (section && !isHomePage()) {
          section.remove();
        }

        currentPath = newPath;
      }
    };
    window.addEventListener("popstate", handlePopState);
    if (isHomePage()) {
      const carouselElement = document.querySelector(".owl-carousel");
      if (carouselElement) {
        utils.initDraggableCarousel(carouselElement);
      }
    }
  };

  /**
   * @description route helper for the application
   */
  const routeHelper = () => {
    const isHomePage = () => window.location.pathname === "/";
    let currentPath = window.location.pathname;
    const cleanupCarousel = () => {
      const carousel = document.querySelector("cx-page-slot[position='Section1_1']");
      if (carousel) {
        carousel.remove();
      }
    };
    const initCarousel = () => {
      const carouselElement = document.querySelector("cx-page-slot[position='Section1_1']");
      if (carouselElement) {
        utils.initDraggableCarousel(carouselElement);
      }
    };
    const onRouteChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        if (isHomePage()) {
          initCarousel();
        } else {
          cleanupCarousel();
        }
        currentPath = newPath;
      }
    };
    const patchHistoryMethod = (type) => {
      const original = history[type];
      history[type] = function (...args) {
        const result = original.apply(this, args);
        window.dispatchEvent(new Event("routechange"));
        return result;
      };
    };
    patchHistoryMethod("pushState");
    patchHistoryMethod("replaceState");
    window.addEventListener("routechange", onRouteChange);
    window.addEventListener("popstate", onRouteChange);
    if (isHomePage()) {
      initCarousel();
    }
  };

  /**
   * @description initialize the application
   */
  const init = async () => {
    try {
      const page = window.location.pathname;
      if (page !== "/") {
        console.error("wrong page");
        return;
      }
      const products = await utils.fetchProducts();
      buildHtml(products);
      buildCss();
      registerEventListeners();
      routeHelper();
      return 0;
    } catch (error) {
      console.error("error", error);
    }
  };
  init();
})();
