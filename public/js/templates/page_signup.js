import { dce } from '/js/shared/helpers.js';
import { user } from '/js/shared/user.js';
import { store } from '/js/shared/store.js';
import { route } from '/js/shared/route.js';


class viewSignup {
  constructor() {

    let container = dce({el: 'DIV', cssClass: 'signup-page'});
    let signupFormContainer = dce({el: 'SECTION', cssClass: 'signup-form'});

    let logoContainer = dce({el: 'DIV', cssClass: 'logo-container'});
    let logo = dce({el: 'IMG', source: '/images/napak_vector.svg', cssClass:'logo'});
    let version = dce({el: 'SPAN', content: '  0.x'})

    logoContainer.append(logo, version);

    let showPwd = false;

    let newAccount = dce({el: 'h3', cssClass: 'mb', content: 'Create new account'});
    let signupForm = dce({el: 'FORM', attrbs: [['name', 'napak-login']]});
    let userEmail = dce({el: 'INPUT', attrbs: [['placeholder', 'email'], ['name', 'email'], ['type', 'email']]});

    let passwordContainer = dce({el: 'DIV', cssStyle: 'position: relative;'});
    let password = dce({el: 'INPUT', attrbs: [['placeholder', 'Password'], ['type', 'password'], ['name', 'pass']]});
    let togglePasswordVisibility = dce({el: 'A', cssClass: 'btn btn_tiny', cssStyle: 'position: absolute; right: 1rem; top: 1.25rem; transform: translateY(-50%)', content : 'abc'});
    passwordContainer.append(password, togglePasswordVisibility);

    togglePasswordVisibility.addEventListener('click', () => {
      if(password.getAttribute('type') === 'password') {
        password.setAttribute('type', 'text');
        togglePasswordVisibility.innerHTML = '• • •';
      }
      else {
        password.setAttribute('type', 'password');
        togglePasswordVisibility.innerHTML = 'abc';
      }
    }, false);

    let passwordAgainContainer = dce({el: 'DIV', cssStyle: 'position: relative;'});
    let passwordAgain = dce({el: 'INPUT', attrbs: [['placeholder', 'Password'], ['type', 'password'], ['name', 'pass']]});
    let togglePasswordAgainVisibility = dce({el: 'A', cssClass: 'btn btn_tiny', cssStyle: 'position: absolute; right: 1rem; top: 1.25rem; transform: translateY(-50%)', content : 'abc'});
    passwordAgainContainer.append(passwordAgain, togglePasswordAgainVisibility);

    togglePasswordAgainVisibility.addEventListener('click', () => {
      if(passwordAgain.getAttribute('type') === 'password') {
        passwordAgain.setAttribute('type', 'text');
        togglePasswordAgainVisibility.innerHTML = '• • •';
      }
      else {
        passwordAgain.setAttribute('type', 'password');
        togglePasswordAgainVisibility.innerHTML = 'abc';
      }
    }, false);

    let signupError = dce({el: 'DIV', cssClass : 'api-message-error'});
    let signupButton = dce({el: 'BUTTON', cssClass: '', content: 'Create account'});
    let goBack = dce({el: 'DIV', cssClass: 'mb mt', content: 'Go back to '});
    let goBackLink = dce({el: 'A', cssClass: 'text-link', content: 'login page'});
    goBack.appendChild(goBackLink);

    goBackLink.addEventListener('click', ()=>{
      route({page:'login'});
    }, false)

    let doSignup = () => {
      if(password.value !== passwordAgain.value) {
        signupError.innerHTML = "PASSWORDS MISMATCH";
        return;
      }

      firebase.auth().createUserWithEmailAndPassword(userEmail.value, password.value).catch(function(error) {
        signupError.innerHTML = error.message;
      }).then((msg) => {
        user.name.email = msg.user.email;
        user.name.id = msg.user.uid;
        // Randomize user name
        let anon = ["Ondra", "Nalle", "Megos", "Klingler", 
                    "Kruder", "Narasaki", "Garnbret", "Noguchi", 
                    "Rubtsov", "Woods", "Webb", "Hill", 
                    "Mori", "Honnold", "Hayes", "Güllich", 
                    "Godoffe", "Albert", "Gresham", "Whittaker", 
                    "Macleod", "Moon", "Caldwell", "Coxsey", 
                    "Findley", "Sharma"];
    
        user.name.displayName = `Anonymous ${anon[~~(Math.random() * anon.length)]}`;
        store.write({
          store: 'users',
          key: 'user',
          keydata: { ...user.name}
        });

      route({page:'home'});
      });
    }

    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      doSignup();
      return;
    }, false);

    signupForm.append(userEmail, passwordContainer, passwordAgainContainer, signupError, signupButton);

    signupFormContainer.append(logoContainer, newAccount, signupForm, goBack);

    container.append(signupFormContainer);

    this.render = () => {
      return container
    }
  }
}

export default viewSignup;
