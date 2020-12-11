import { globals } from '/js/shared/globals.js';
import { storeObserver } from '/js/shared/helpers.js';

let route = (params) => {

  window.addEventListener('popstate', (evt) => {
    console.log('meh')
  }, false);

  if(params !== globals.route) {
    // Clear store observers marked with removeOnRouteChange
    storeObserver.clear();
    let trgt = new globals.routes[params];
    globals.route = params;
    document.querySelector('.page-content').innerHTML = "";
    document.querySelector('.page-content').appendChild(trgt.render());

    history.pushState( {}, globals.route, globals.route );

  }
};


export { route }
