/*

Observers

globals
  :currentGroup
    > getGroupStanding
  :currentClimbingType
    > updateGroupStanding
*/

import { dce, storeObserver, countTopX, averageGrade } from '/js/shared/helpers.js';
import picker from '/js/components/picker.js';
import dropdownMenu from '/js/components/dropdown.js';
import statusTicker from '/js/templates/partials/status_ticker.js';
import { user } from '/js/shared/user.js';

class viewGroups {
  constructor() {
    const db = firebase.firestore();
    const dbuser = firebase.auth().currentUser;

    // container for user groups
    let groups = {}
    let groupData;

    let container = dce({el: 'DIV', cssClass: 'page-groups'});
    let groupSelectContainer = dce({el: 'SECTION', cssClass: 'group-select'});

    // Status ticker
    let ticker = new statusTicker();

    let groupTypeSelector = new picker({
      cssClass: 'horizontal-menu centerize',
      id: 'ascent-type-selector',
      targetObj: 'groupType',
      options: [
        { title: 'Your groups', value: 'userGroups', selected: true },
        { title: 'Public groups', value: 'publicGroups' }],
      callback : () => {alert(globals.groupType)}
    });

    let groupSelect = new dropdownMenu({
      cssClass: 'horizontal-menu full-width',
      id: 'groupSelector',
      targetObj: 'currentGroup',
    });

    // get group standing
    let getGroupStanding = () => {
      let groupUsers = groups.users;
      let paska = [];
      for (let i=0, j=groupUsers.length; i<j;i++) {
        db.collection('score').doc(groupUsers[i].id).get().then( (doc) => {
          let userData = doc.data();
          if(userData) {
            let currentScore = userData.current;
            groups.users[i].current = currentScore;
            paska.push({id: groupUsers[i].id, current: currentScore, displayName: userData.displayName});
            }
        }).then( (doc) => {
          groupData = paska;
          updateGroupStanding();     
        });
      }
    }


    let updateGroupStanding = () => {
      groupStanding.innerHTML = "";
      for(let i = 0, j = groupData.length; i < j; i++) {
        let score = groupData[i].current[globals.currentClimbingType];
        let avgGrade = averageGrade(5, 'thirtydays');
        let groupEntry = dce({el: 'LI', cssClass: 'entry-container'});
        let entryPos = dce({el: 'SPAN', content: `${i+1}.`});
        let entryName = dce({el: 'SPAN', content:  groupData[i].displayName});
        let entryPointsContainer = dce({el: 'SPAN', content: (score) ? score: '-'});
        let entryPointsDirection = dce({el: 'SPAN', cssClass : 'dir', content: ['↓', '↑', '-'][~~(3 * Math.random())]});
        entryPointsContainer.appendChild(entryPointsDirection);
        let entryAvgGrade = dce({el: 'SPAN', content: avgGrade});

        groupEntry.append(entryPos, entryName, entryPointsContainer, entryAvgGrade);
        groupStanding.append(groupEntry, groupEntry);
      }
    }

    groupSelectContainer.append(groupTypeSelector.render(), groupSelect.render());

    let rankingContainer = dce({el: 'SECTION', cssClass: 'ranking scroll-container'});

    let groupClimbingTypeSelector = new picker({
      cssClass: 'horizontal-menu full-width',
      id: 'ascent-type-selector',
      targetObj: 'currentClimbingType',
      options: [
        { title: 'Boulder', value: 'boulder', selected: true },
        { title: 'Sport', value: 'sport' },
        { title: 'Top rope', value: 'toprope' },
        { title: 'Trad', value: 'trad' },
      ]
    });

    let groupStanding = dce({el: 'UL', cssClass: 'group-toplist'});

    rankingContainer.append(groupClimbingTypeSelector.render(), groupStanding)

    let createNewGroupButton = dce({el: 'a', cssClass: 'btn mt mb'});
    let plusIcon = dce({el: 'IMG', source: '/images/icon_plus.svg'});
    let buttonTitle = document.createTextNode('Create new group');
    createNewGroupButton.append(plusIcon, buttonTitle);
    rankingContainer.append(createNewGroupButton);


    container.append(ticker.render(), groupSelectContainer, rankingContainer);

// sync user groups
    let newStatusMessage = {
      message : 'Synchronizing groups data',
      spinner: true,
      timeout: -1,
      id : 'tick-sync'
    };

    globals.serverMessage.push(newStatusMessage);
    globals.serverMessage = globals.serverMessage;

    let updateGroupList = () => {
      // Get user groups
      db.collection('users').doc(dbuser.uid).get().then( (doc) => {
        let userGroups = doc.data().groups;
        if(userGroups) {
          for(let i=0, j=userGroups.length; i<j; i++) {
            db.collection('groups').doc(userGroups[i]).get().then( (doc) => {
              groups = {
                title: doc.data().name,
                id: userGroups[i],
                users: doc.data().users
              }; 

              let group = {
                title: doc.data().name,
                value: userGroups[i],
                selected: (i === 0) ? true : false
              }
              groupSelect.pushItem(group);
            });
          }
        }
        globals.serverMessage[0].finished = true; 
        globals.serverMessage = globals.serverMessage;
      });
    }
    updateGroupList();

    storeObserver.add({
      store: globals,
      key: 'currentGroup', 
      callback: getGroupStanding,
      removeOnRouteChange: true
    });
    
    storeObserver.add({
      store: globals,
      key: 'currentClimbingType', 
      callback: updateGroupStanding,
      removeOnRouteChange: true
    });

    this.render = () => {
      return container
    }
  }
}

export default viewGroups;
