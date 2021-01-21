// Client ID and API key from the Developer Console
const CLIENT_ID = "808096832640-935q9vjksmj3f60u7lkikhieg43sn8o3.apps.googleusercontent.com";
const API_KEY = "AIzaSyD4TjVoA0rjuxPt3pw-6TPfCw18Qem-vfc";

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

const authorizeButton = document.getElementById('authorize_button');
const signoutButton = document.getElementById('signout_button');
const authBox = document.getElementById('auth-box');
const shopContainer = document.getElementById('shop-container');

let productList;
let filteredList;
/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function (error) {
    console.log(error);
    // Should we display this to the user?
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authBox.style.display = 'none';
    signoutButton.style.display = 'block';
    shopContainer.style.display = 'flex';
    getProducts();
    getCategories();
  } else {
    authBox.style.display = 'block';
    signoutButton.style.display = 'none';
    shopContainer.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function getProducts() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1a4ZZ7E4M3xn6SKBvaMPwmc6ueeai3lHJaXpUnnHF1Jw',
    range: 'Data!B3:G',
  }).then(function (response) {
    let range = response.result;
    if (range.values.length > 0) {
      productList = range.values;
      // Set our searchlist to this received whole productlist
      filteredList = productList;

      parseData(range.values)
    } else {
      console.log('No data found.');
    }
  }, function (response) {
    console.log('Error: ' + response.result.error.message);
  });
}

function getCategories() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1a4ZZ7E4M3xn6SKBvaMPwmc6ueeai3lHJaXpUnnHF1Jw',
    range: 'Data!C3:C',
  }).then(function (response) {
    let range = response.result;
    if (range.values.length > 0) {
      const newArr = [];
      for (let i of range.values) {
        newArr.push(i[0])
      }
      
      // Categories is without duplicates
      let categories = [...new Set(newArr)]
      // Remove undefined category
      const UndefIndex = categories.indexOf(undefined);
      if (UndefIndex > -1) {
        categories.splice(UndefIndex, 1);
      }
      
      let categoryList = document.getElementById('menuCategory');

      // Clear list
      categoryList.innerHTML = "";

      // Create artificial "all products" category
      let allCategory = document.createElement('li');
      allCategory.className = "categoryItem";
      allCategory.innerText = 'Alles';
      categoryList.appendChild(allCategory);
      allCategory.style.backgroundColor = '#813cff';
      allCategory.style.color = '#FFF';

      allCategory.addEventListener('click', function (e) {
        filteredList = productList;
        parseData(filteredList);
        makePurple(e);
      })

      for (let cat of categories) {
        let li = document.createElement('li');
        li.className = "categoryItem";
        li.innerText = cat;
        categoryList.appendChild(li);
        li.addEventListener('click', function (e) {
          makePurple(e);
          let categoryFilter = productList.filter((product) => {
            return product[1].toLowerCase().includes(e.target.innerText.toLowerCase());
          })
          filteredList = categoryFilter
          parseData(categoryFilter);
        })
      }

    } else {
      appendPre('No data found.');
    }
  }, function (response) {
    appendPre('Error: ' + response.result.error.message);
  });
}

function makePurple(e) {
  for (let i of document.querySelectorAll(".categoryItem")) {
    i.style.backgroundColor = '#FFF';
    i.style.color = '#202020';
  }
  e.target.style.backgroundColor = '#813cff';
  e.target.style.color = '#FFF';
}

function parseData(sheetRange) {
  let productList = document.getElementById('productList');
  let productName = document.getElementById('productName');
  let productImage = document.getElementById('productImage');
  let productPrice = document.getElementById('productPrice');
  let productCategory = document.getElementById('productCategory');
  let productSupplier = document.getElementById('productSupplier');
  productList.innerHTML = "";
  for (i = 0; i < sheetRange.length; i++) {
    let row = sheetRange[i];
    if (i == 0) {
      productName.innerText = row[0];
      productImage.src = row[5];
      productPrice.innerText = row[2];
      productCategory.innerText = row[1];
      productSupplier.innerText = row[3];
      productSupplier.href = row[4];
    }

    let productRow = document.createElement('li');
    productRow.innerText = row[0];
    productRow.dataset.productImg = row[5];
    productRow.dataset.productName = row[0];
    productRow.dataset.productPrice = row[2];
    productRow.dataset.productCategory = row[1];
    productRow.dataset.productSupplierLink = row[4]
    productRow.dataset.productSupplier = row[3];
    productList.appendChild(productRow)
    productRow.addEventListener('click', function (e) {
      // Get dataset from target
      let elementData = e.target.dataset;
      // Fill detail section with data from item that was clicked
      productName.innerText = elementData.productName;
      productImage.src = elementData.productImg;
      productPrice.innerText = elementData.productPrice;
      productCategory.innerText = elementData.productCategory;
      productSupplier.innerText = elementData.productSupplier;
      productSupplier.href = elementData.productSupplierLink;
    })
  }
}

let search = document.getElementById('searchbar');
search.addEventListener('keyup', function (e) {
  let filter = filteredList.filter((product) => {
    return product[0].toLowerCase().includes(e.target.value.toLowerCase());
  })
  parseData(filter);
})