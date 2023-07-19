// Initialize Firebase with your project's configuration
const firebaseConfig = {
    apiKey: "AIzaSyCiG3pBNppvdiZUv2nS0Zpmv8kMGRiQGh0",
    authDomain: "xdgm-memorie-wall.firebaseapp.com",
    projectId: "xdgm-memorie-wall",
    storageBucket: "xdgm-memorie-wall.appspot.com",
    messagingSenderId: "644674909301",
    appId: "1:644674909301:web:181ac410a2407ab9ddf43c",
    measurementId: "G-ZNPNV3TGMG"
  };
    
  firebase.initializeApp(firebaseConfig);
  var currentUserID = null;
  // Function to handle Google Sign-In
  function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        // User signed in successfully, handle authentication
        // You can add code to fetch user-specific data here
        currentUserID = result.user.uid
        displayUserLinks();
        enableUI();
      })
      .catch((error) => {
        // Handle sign-in error
        console.error(error);
      });
  }
  
  // Function to create short links and save to Firebase
  function createShortLink() {
    const longURL = prompt("Enter the destination URL");
    const shortURL = prompt("Enter shortURL:")
    if (longURL) {
      // Generate a short link using your preferred method
     
      
      // Save the link to Firebase
      
     createUniqueShortLink(currentUserID,longURL,shortURL)
    }
  }
  async function editLink(linkKey,shortURL) {
    const newLongURL = prompt('Enter Updated Destination URL')
    const userId = currentUserID;
    const db = firebase.database();
    
    // Check if the linkKey exists in the current user's links
    const linkSnapshot = await db.ref('dynalinks/users/' + userId + '/links/' + linkKey)
      .once('value');
  
    if (!linkSnapshot.exists()) {
      // Link key not found, return an error or handle accordingly
      console.log("ERROR")
      return { error: 'Link not found or does not belong to the user' };
    }
  const formatedURL = prependProtocol(newLongURL)
  console.log(formatedURL)
    // Update the longURL for the specified linkKey
    await db.ref('dynalinks/users/' + userId + '/links/' + linkKey)
      .update({ longURL: formatedURL });
    await db.ref('dynalinks/globalIndex/' + shortURL).set(formatedURL);
    return { success: true };
  }

  function enableUI(){
    document.querySelector('table').hidden = false;
    document.querySelector('#createLinkButton').hidden = false;
  }
  // Function to retrieve and display user's links
  function displayUserLinks() {
    const userId = currentUserID;
    const linkList = document.getElementById('linkList');
  
    firebase.database().ref('dynalinks/users/' + userId + '/links').on('value', (snapshot) => {
      linkList.innerHTML = '';
      snapshot.forEach((childSnapshot) => {
        const linkData = childSnapshot.val();
        const row = document.createElement('tr');
  
        // Create cells for Short URL and Actions
        const shortURLCell = document.createElement('td');
        const actionsCell = document.createElement('td');
  
        const linkAnchor = document.createElement('a');
        linkAnchor.href = `/dynalinks/?alias=${linkData.shortURL}`;
        linkAnchor.target = '_blank';
        const link = window.location.href+'/?alias='+linkData.shortURL
        linkAnchor.textContent = link.replace('/index.html','');
        shortURLCell.appendChild(linkAnchor);
  
        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
          editLink(childSnapshot.key, linkData.shortURL);
        });
        actionsCell.appendChild(editButton);
  
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
          deleteLink(childSnapshot.key, linkData.shortURL);
        });
        actionsCell.appendChild(deleteButton);
        
        const qrButton = document.createElement('button');
        qrButton.classList.add('edit-button');
        qrButton.textContent = 'MakQR'
        qrButton.addEventListener('click',()=>{
            const a = document.createElement('a');
            a.target= "_blank"
            a.href = `/makqr/?link=${window.location.host+'/dynalinks/?alias='+linkData.shortURL}`
            a.click()
        })
        actionsCell.appendChild(qrButton)
        // Append cells to the row
        row.appendChild(shortURLCell);
        row.appendChild(actionsCell);
  
        // Append the row to the table body
        linkList.appendChild(row);
      });
    });
  }
  
  async function deleteLink(linkKey, shortURL) {
    const userId = currentUserID;
    const db = firebase.database();
  
    // Check if the linkKey exists in the current user's links
    const linkSnapshot = await db.ref('dynalinks/users/' + userId + '/links/' + linkKey)
      .once('value');
  
    if (!linkSnapshot.exists()) {
      // Link key not found, return an error or handle accordingly
      console.log("ERROR");
      return { error: 'Link not found or does not belong to the user' };
    }
  
    // Delete the link from the user's links
    await db.ref('dynalinks/users/' + userId + '/links/' + linkKey).remove();
  
    // Delete the link from the global index
    await db.ref('dynalinks/globalIndex/' + shortURL).remove();
  
    return { success: true };
  }
  
  // Function to edit a link (not implemented in this example)
  

  // Function to create a unique short link for the user
// Function to create a unique short link for the user
async function createUniqueShortLink(userId, longURL, shortURL) {
    const db = firebase.database();
  
    // Check if the provided short URL exists in the global index
    const globalIndexSnapshot = await db.ref('dynalinks/globalIndex/' + shortURL)
      .once('value');
  
    if (globalIndexSnapshot.exists()) {
      // Short URL already exists globally, return an error or handle accordingly
      alert('Short URL already in use')
      return { error: 'Short URL already in use' };
    }
    const userLinksSnapshot = await db.ref('dynalinks/users/' + userId + '/links').once('value');
    const userLinkCount = userLinksSnapshot.numChildren();
    const limitSnapshot = await db.ref('dynalinks/limit').once('value');
    const limit = limitSnapshot.val();
  
    if (userLinkCount >= limit) {
      // User has reached the link generation limit, return an error or handle accordingly
      alert('You have reached the link generation limit.');
      return { error: 'Link generation limit reached' };
    }
    // Save the link to the database under the current user's links node
    const linkData = {
      longURL: prependProtocol(longURL),
      shortURL: shortURL,
      createdOn: new Date().toISOString()
    };
  
    await db.ref('dynalinks/users/' + userId + '/links').push(linkData);
  
    // Update the global index to mark the short URL as used by the current user
    await db.ref('dynalinks/globalIndex/' + shortURL).set(linkData.longURL);
  
    return { shortURL: shortURL };
  }
  
  async function logQueryParameters() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    
    // Check if there are any query parameters
    if (urlSearchParams.has('alias')) {
        document.body.innerHTML = ''
        const db = firebase.database();
      const aliasValue = urlSearchParams.get('alias');
      const globalIndexSnapshot = await db.ref('dynalinks/globalIndex/' + aliasValue)
        .once('value');
        
     window.location = globalIndexSnapshot.val()
    }
  }
  // Event handler for "Sign In with Google" button
  document.addEventListener('DOMContentLoaded', () => {
    const signInButton = document.getElementById('signInButton');
    signInButton.addEventListener('click', signInWithGoogle);
  });
  
  // Event handler for "Create Link" button
  document.addEventListener('DOMContentLoaded', () => {
    const createLinkButton = document.getElementById('createLinkButton');
    createLinkButton.addEventListener('click', createShortLink);
  });
  document.addEventListener('DOMContentLoaded', () => {
    logQueryParameters();
  });
  function prependProtocol(linkValue) {
           
    if (linkValue !== '' && !linkValue.startsWith('http://') && !linkValue.startsWith('https://')) {
        linkValue = 'http://' + linkValue;
        
    }
    return linkValue
}