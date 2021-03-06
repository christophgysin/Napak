/*

Observers

globals
  :currentGroup
    > getGroupStanding
  :currentClimbingType
    > updateGroupStanding
*/

import { dce, storeObserver, UUID } from '/js/shared/helpers.js';
import picker from '/js/components/picker.js';
import modalWindow from '/js/components/modal.js';
import dropdownMenu from '/js/components/dropdown.js';
import toggleSwitch from '/js/components/toggleswitch.js';
import statusTicker from '/js/templates/partials/status_ticker.js';
import groupOptions from '/js/templates/partials/group_options.js';
import groupStanding from '/js/templates/partials/group_standing.js';
import cryptPwd from '/js/shared/crypto.js';

class viewGroups {
  constructor() {
    const db = firebase.firestore();
    const dbuser = firebase.auth().currentUser;

    let groups = {
      publicGroups : {},
      userGroups : {}
    };

    let options = new groupOptions({
      options : [
//        ['Edit group', () => { console.log('meh')}],
        ['Create new group', () => {this.createNewGroup()}]
      ]
    });

    // DOM
    let container = dce({el: 'DIV', cssClass: 'page-groups'});
    let groupSelectContainer = dce({el: 'SECTION', cssClass: 'group-select'});

    let ticker = new statusTicker({
      titlePrefix : 'Groups',
      tapAction: () => { options.showMenu() }
    });

    let groupTypeSelector = new picker({
      cssClass: 'horizontal-menu full-width',
      targetObj: 'groupType',
      options: [
        { title: 'My groups', value: 'userGroups', selected: true },
        { title: 'All groups', value: 'publicGroups' }],
      callback : () => {
        let dropdownElements = updateItems();
        globals.currentGroup = null; // maybe take this away from global ... 
        groupSelect.createItems(dropdownElements);
      }
    });

    // Dropdown menu
    let groupSelect = new dropdownMenu({
      cssClass: 'horizontal-menu full-width',
      id: 'groupSelector',
      targetObj: 'currentGroup',
    });

    groupSelectContainer.append(groupTypeSelector.render(), groupSelect.render());

    // ranking container
    let rankingContainer = dce({el: 'SECTION', cssClass: 'ranking scroll-container'});

    // discipline selector for ranking
    let groupClimbingTypeSelector = new picker({
      cssClass: 'horizontal-menu full-width',
      targetObj: 'currentClimbingType',
      options: [
        { title: 'Boulder', value: 'boulder', selected: (globals.currentClimbingType === 'boulder') ? true: false},
        { title: 'Sport', value: 'sport', selected: (globals.currentClimbingType === 'sport') ? true: false},
        { title: 'Top rope', value: 'toprope', selected: (globals.currentClimbingType === 'toprope') ? true: false},
        { title: 'Trad', value: 'trad', selected: (globals.currentClimbingType === 'trad') ? true: false},
      ]
    });


    let indoorsOutdoorsSelector = new toggleSwitch({
      cssClass  : 'horizontal-menu full-width',
      targetObj : 'indoorsOutdoors',
      options   : [
        {title: 'Indoors', value: 'indoors', selected: (globals.indoorsOutdoors === 'indoors') ? true: false},
        {title: 'Outdoors', value: 'outdoors', selected: (globals.indoorsOutdoors === 'outdoors') ? true: false}
      ]
    });

    let groupStandingContainer = new groupStanding({mother: this});

    rankingContainer.append(groupClimbingTypeSelector.render(), indoorsOutdoorsSelector.render(), groupStandingContainer.render())

    container.append(ticker.render(), options.render(), groupSelectContainer, rankingContainer);



    // get group standing
    let getGroupStanding = () => {
      if(!globals.currentGroup) {
        updateGroupStanding();
        return;
      }

      let groupUsers = groups[globals.groupType][globals.currentGroup].users;
      if(!groupUsers || !groupUsers.length) {
        updateGroupStanding(); 
        return;
      }

      let groupStandingData = [];

      for (let i=0, j=groupUsers.length; i<j;i++) {
        db.collection('score').doc(groupUsers[i]).get().then( (doc) => {
          let userData = doc.data();
          if(userData) {
            let currentScore = userData.current;
            groupStandingData.push({id: groupUsers[i], current: currentScore, displayName: userData.displayName});
            }
        }).then( (doc) => {
          groups[globals.groupType][globals.currentGroup].userScore = groupStandingData;
          if(i === groupUsers.length-1) {
            updateGroupStanding();
          }
        });
      }
    }

// update group standing
    let updateGroupStanding = () => {
      if(groups[globals.groupType][globals.currentGroup]) {
        groupStandingContainer.update({data: groups[globals.groupType][globals.currentGroup]['userScore'], group: groups[globals.groupType][globals.currentGroup]});
      }
    }


// Load user groups and public groups
    let loadUserGroups = () => {
      db.collection("groups")
      .get()
      .then(function(querySnapshot) {
        // Show spinner
        let newStatusMessage = {
          message : 'Synchronizing groups data',
          spinner: true,
          timeout: -1,
          id : 'group-sync'
        };

        globals.serverMessage.push(newStatusMessage);
        globals.serverMessage = globals.serverMessage;

        let i=0, j = 0;
        querySnapshot.forEach(function(doc) {
          let groupData = doc.data();
          // Groups where user is a member already
          if(groupData.users && groupData.users.length && groupData.users.includes(dbuser.uid)) {
            groups['userGroups'][doc.id] = {
              title: groupData.name,
              value: doc.id,
              users: (groupData.users) ? groupData.users : [],
              id: doc.id,
              public: groupData.public,
              locked: (groupData.public) ? false : true,
              selected: (i == 0) ? true : false
              };
            i++;
            }
          // All other groups
          else {
            groups['publicGroups'][doc.id] = {
              title: groupData.name,
              value: doc.id,
              users: (groupData.users) ? groupData.users : [],
              id: doc.id,
              selected: (j == 0) ? true : false,
              public: groupData.public,
              locked: (groupData.public) ? false : true
              };
            j++;
            }
          });
      })
      .then(()=>{
        globals.serverMessage[0].finished = true;
        globals.serverMessage = globals.serverMessage;
        // create array of object to create pulldown items
        let dropdownElements = updateItems();
        groupSelect.createItems(dropdownElements);

        groups.updateGroups = () => {
          let dropdownElements = updateItems();
          groupSelect.createItems(dropdownElements);
        }
        
        this.groups = groups;    
    })
      .catch(function(error) {
          console.log("Error getting documents: ", error);
      });
    }
    
    loadUserGroups();

// Update dropdown items
    let updateItems = () => {
      let items = [];
      for (let key in groups[globals.groupType]) {
        items.push(groups[globals.groupType][key])
      }
      return items;
    }

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

    storeObserver.add({
      store: globals,
      key: 'indoorsOutdoors',
      callback: updateGroupStanding,
      removeOnRouteChange: true
    });


    this.createNewGroup = () => {
      let newGroupFormContainer = dce({el: 'FORM', cssClass: ''});
// Group name
      let groupNameTitle = dce({el: 'H3', cssClass: 'mb', content: 'Group name (min 3 letters)'});
      let groupName = dce({el: 'INPUT', cssClass:'', attrbs: [['placeholder', 'Group name'], ['minlength', 3], ['required', 'required']] });
      newGroupFormContainer.append(groupNameTitle, groupName);

      let isPublic = true;
      let groupPublicityTitle = dce({el: 'H3', cssClass: 'mb', content: 'Public'});
      let groupPublicity = new toggleSwitch({
        cssClass  : 'horizontal-menu full-width',
        targetObj : isPublic,
        targetStore: false,
        options   : [
          {title: 'Yes', value: true, selected: true},
          {title: 'No', value: false}],
        callback : (trgt) => {
          isPublic = trgt; 
          if(isPublic) {
            passCodeContainer.classList.add('hidden');
            password.removeAttribute('required');
          }
          else {
            passCodeContainer.classList.remove('hidden');            
            password.setAttribute('required', '');
          }
        }
      });


      newGroupFormContainer.append(groupPublicityTitle, groupPublicity.render());

      let passCodeContainer = dce({el: 'DIV', cssClass: 'hidden'});
      let passcode = dce({el: 'INPUT', cssClass:'', attrbs: [['placeholder', 'Passcode'], ['hidden', true], ['disabled', 'disabled'],['value', UUID()]] });
      let passwordTitle = dce({el: 'H3', cssClass: 'mb', content: 'Password (min 5 letters)'});
      let password = dce({el: 'INPUT', cssClass:'', attrbs: [['placeholder', 'Password'], ['minlength', 5]] });

      passCodeContainer.append(passcode, passwordTitle, password);
      newGroupFormContainer.appendChild(passCodeContainer);

      const addGroupToStore = (mother) => {
        let isValid = newGroupFormContainer.checkValidity();
        if(!isValid) {
          return;
        }
        let secret = ''; 

        let addGroupToDatabase = () => {
          let group = {
            name: groupName.value,
            owner: dbuser.uid,
            public: isPublic,
            secret: secret,
            users: [dbuser.uid]
          };
          
          db.collection("groups")
          .add(group)
          .then(function(docRef) {
            group.title = group.name;
            group.value = docRef.id;
            group.id = docRef.id;
            groups.userGroups[`${docRef.id}`] = JSON.parse(JSON.stringify(group));
            groups.updateGroups();
          })
          .catch(function(error) {
          });
        }

        if( !isPublic ) {
          let crypter = new cryptPwd();
          crypter.encrypt({data: passcode.value, password: password.value}).then((data)=>{
            secret = data;
            addGroupToDatabase()
          });
       }
       else {
        addGroupToDatabase()
       }
       modal.close();

       globals.standardMessage.unshift({
        message: `Created new group ${groupName.value}`,
        timeout: 2
      });
      globals.standardMessage = globals.standardMessage;

      }

      let modal = new modalWindow({
        title         : 'Create new group',
        modalContent  : newGroupFormContainer,
        buttons       : [
          ['Create', () => { addGroupToStore(this); }, 'preferred'],
          ['Cancel', () => { modal.close(); }],
          ],
        open          : true //auto open modal
      });

      container.appendChild(modal.render())
    }

    this.render = () => {
      return container
    }

  }
}

export default viewGroups;
