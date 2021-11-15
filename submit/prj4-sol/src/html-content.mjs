/** Return an element which represents an account search-result
 *  for account having id and holderId and WS url selfHref.
 */
export function makeSearchResult(id, holderId, selfHref) {
  const element = makeElement('div', {class: 'account-result', id });
  element.innerHTML = `
    <dl>
      <dt>Account ID:</dt><dd>${id}</dd>
      <dt>Holder ID:</dt><dd>${holderId}</dd>
    </dl>
    <div>
      <a class="details" href="#" data-ws-href="${selfHref}" 
         rel="describedby">
        Details
      </a>
    </div>
  `;
  return element;
}

/** Return an element which represents account detail for
 *  account having id, holderId and balance.
 */
export function makeAccountDetail(id, holderId, balance) {
  console.assert(typeof balance === 'number',
		 `account balance "${balance}" has type ${typeof balance}`);
  const balanceText = balance.toFixed(2);
  const element = makeElement('div', {class: 'account-detail', id });
  const extendId = `extend-${id}`;
  element.innerHTML = `
    <dl>
      <dt>Account ID:</dt><dd>${id}</dd>  
      <dt>Holder ID:</dt><dd>${holderId}</dd>
      <dt>Balance:</dt><dd>${balanceText}</dd>
    </dl>
    <div id="${extendId}" data-id="${id}" class="extendFn">extendFn</div>
  `;
  return element;
}

export function makeScrollElement(links) {
  const scroll = makeElement('div', { class: 'scroll' }, '');
  for (const [rel, text] of Object.entries({prev: '<<', next: '>>'})) {
    const link = links.find(link => link.rel === rel);
    if (link) {
      const attr = { href: '#', 'data-ws-href': link.href, rel };
      const control = makeElement('a', attr, text);
      scroll.append(control);
    }
  }
  return scroll;
}
    
/** Return a new DOM element with specified tagName, attributes
 *  given by object attrs and contained text.
 */
export function makeElement(tagName, attrs={}, text='') {
  const element = document.createElement(tagName);
  for (const [k, v] of Object.entries(attrs)) {
    element.setAttribute(k, v);
  }
  if (text.length > 0) element.append(text);
  return element;
}



export const IDS = {
  create: 'create-section',
  search: 'search-section',
  detail: 'detail-section',
};


const STYLE = `
  <style type="text/css">

    nav ul {
      list-style-type: none;
      display: inline;
    }

    .nav-create {
      float: left;
    }

    .nav-search {
      float: right;
    }

    .heading {
      font-weight: bold;
    }

    button {
      border-radius: 10px;
      background-color: var(--light);
      padding: 5px;
      border-color: var(--dark);
      color: var(--darkest);
    }


    button:hover {
      background-color: var(--dark);
      color: white;
    }

    .form-grid2 {
      display: grid;
      grid-template-columns: 0.5fr 1fr;
      grid-gap: 2vw;
    }

    .scroll {
      font-size: 150%;
      padding: 10pt 0pt;
      width: 100;
    }
    
    .scroll a[rel="prev"] {
      float: left;
    }

    .scroll a[rel="next"] {
      float: right;
    }

    .account-result, .account-detail {
      width: 70%;
      margin: 10px;
      padding: 10px;
      background-color: white;
      border: 2px solid blue;
    }

    .account-result dl, .account-detail dl {
      display: grid;
      grid-template-columns: 0.5fr 1fr;
      grid-gap: 1vw;
    }

    input, textarea, select {
      width: 50%;
    }

    label {
      font-weight: bold;
      text-align: right;
    }

    .invisible {
      display: none;
    }

    .error {
      color: red;
    }
  </style>
`;

export const HTML = `
  ${STYLE}

  <section id=${IDS.create}>
    <h2 class="heading">Create Account</h2>
    <nav>
      <ul>
        <li class="nav-search"><a href="#">Search Accounts</a></li>
      </ul>
    </nav>
    <ul class="errors"></ul>
    <form id="create-form" class="form-grid2">
      <label for="create-holderId">Holder ID</label>
      <span>
        <input id="create-holderId" name="holderId" id><br>
        <span class="error" data-widget="holderId"></span>
      </span>
      <span>&nbsp;</span>
      <button type="submit">Create Account</button>
    </form>
   </section>

  <section id=${IDS.search}>
    <h2 class="heading">Search Accounts</h2>
    <nav>
      <ul>
        <li class="nav-create"><a href="#">Create Account</a></li>
      </ul>
    </nav>
    <ul class="errors"></ul>
    <form id="search-form" class="form-grid2">
      <label for="search-id">Account ID</label>
      <span>
        <input id="search-id" name="id"><br>
        <span class="error" data-widget="id"></span>
      </span>
      <label for="search-holderId">Holder ID</label>
      <span>
        <input id="search-holderId" name="holderId" id><br>
        <span class="error" data-widget="holderId"></span>
      </span>
    </form>
    <p id="search-results"></p>
  </section>

  <section id=${IDS.detail}>
    <h2 class="heading">Account Detail</h2>
    <nav>
      <ul>
        <li class="nav-create"><a href="#">Create Account</a></li>
        <li class="nav-search"><a href="#">Search Accounts</a></li>
      </ul>
    </nav>
    <ul class="errors"></ul>
    <p id="account-detail"></p>
  </section>
   

`;

