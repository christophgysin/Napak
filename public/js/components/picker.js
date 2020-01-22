import { dce } from '/js/shared/helpers.js';
import { globals } from '/js/shared/globals.js';

class picker {
  constructor(params) {
    this.selected = false;
    this.targetObj = params.targetObj;

    let pickerElement = dce({el: 'UL', cssClass: params.cssClass, id: params.id});

    for(let i=0, j=params.options.length; i<j;i++) {
      let option = dce({el: 'LI'});
      if(params.options[i].selected) {
        option.classList.add('selected');
        this.selected = params.options[i];
        globals[params.targetObj] = params.options[i].value;
      }
      let optionLink = dce({el: 'A'});
      optionLink.value = params.options[i].value;
      let optionLinkText = dce({el: 'SPAN', cssClass: 'menu-title', content: params.options[i].title});

      let temp = params.options[i];
      optionLink.addEventListener('click', () => {this.set(optionLink, temp)}, false);

      optionLink.appendChild(optionLinkText);

      // Legends tag
      let legensHolder = dce({el: 'SPAN', cssClass: 'legends-holder'});
      let legendTag = dce({el: 'SPAN', cssClass: `legend type-${params.options[i].value}`, content: (params.options[i].legend) ? params.options[i].legend : ''});

      legendTag.value = params.options[i].val;
      legensHolder.appendChild(legendTag);
      optionLink.appendChild(legensHolder);

      // update legends
      let updateLegends = () => {
        let val = legendTag.value;
        if(val) {
          let count = val.split('.').reduce((o,i)=>o[i], globals);
          legendTag.innerHTML = (count) ? count : '';
        }
      };

      globals.storeObservers.push({key: 'indoorsOutdoors', callback: updateLegends });
      globals.storeObservers.push({key: 'ticks', callback: updateLegends});

      option.appendChild(optionLink);

      pickerElement.appendChild(option);
    }

    this.render = () => {
      return pickerElement;
    }

    this.set = (el, data) => {
      globals[params.targetObj] = el.value;
      let container = el.parentNode.parentNode;
      let selectedItem = container.querySelector('.selected');
      selectedItem.classList.remove('selected');
      el.parentNode.classList.add('selected');

      this.selected = data;
      if(params.callback) {
        params.callback();
      }
    }
  }
}

export default picker;