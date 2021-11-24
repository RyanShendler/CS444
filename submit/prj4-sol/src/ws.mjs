//factory function is default export
export default function makeWs(url) { return new Ws(url); }

//On error, all web services return an object of the form:
// { errors: [ message, options?: { widget? } ] }.
class Ws {

  //most domain-related services simple delegate to get() or _post().
  
  /** Create web services based on url (protocol, hostname and port, no
   *  path).
   */
  constructor(url) {
    this._urlBase = url;
  }


  /** Use web-services to create a new account based on params { holderId }.  
   *  Returns location header 
   */
  async newAccount(params) { //seems good
    return await this._post(BASE, params);
  }

  /** Use web-services to get account info for id.  Successful return
   *  of the form:
   *
   *    { links: [ selfLink ],
   *      result: { id, holderId, balance: Number, }
   *    }
   */
  async info({id}) {
    //TODO: not needed for this project
  }

  /** Use web-services to search accounts for params { id?, holderId? }.
   *  If successful, return object of the form:
   *
   *  { links: [ SelfLink, NextLink?, PrevLink? ],
   *    result: [ { links: [ SelfLink ],
   *                result: { id, holderId },
   *              },
   *            ],
   *  }
   *
   * If there are no results, then the returned object should have its
   * result property set to the empty list [].
   */
  async searchAccounts(params={}) { //needs testing
    return await this.get(BASE, params);
  }

  async newAct(params) {
    //TODO: not needed for this project
  }

  async query(params) {
    //TODO: not needed for this project
  }

  async statement(params) {
    //TODO: not needed for this project
  }

  /** Perform a GET request for path on this.url using query params q.
   *  Return returned response (which may be in error even when the
   *  response is ok)
   */
  async get(path, q={}) { //seems good
    try{
    	const url = new URL(path, this._urlBase);
    	for(const [k, v] of Object.entries(q)){
    		url.searchParams.set(k, v);
    	}
    	const response = await fetch(url);
    	return await response.json(); //returns response as JSON
    }catch(err){ //network error
    	console.error(err.toString());
    	return {errors: [{message: err.toString()}]};
    }
  }

  /** Do a POST request for path on this.url using data as body.
   *  If successful, return the Location header; otherwise
   *  return a suitable errors response.
   */
  async _post(path, data={}) { //seems good
    try{
    	const url = new URL(path, this._urlBase);
    	const response = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
    	if(response.ok){ //successful
    		return response.headers.get('Location');
    	} else{ //error
    		return await response.json();
    	}
    }catch(err){ //network error
    	console.error(err.toString());
    	return {errors: [{message: err.toString()}]};
    }
  }

  
}

const BASE = '/accounts';
