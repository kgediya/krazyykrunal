document.addEventListener("DOMContentLoaded", function() {
  // Typewriter and Menu code here...
// Typewriter effect
 const greetings = [
    "કેમ છો", "कसा काय", "नમस्ते", "வணக்கம்", "നമസ്കാരം", "ನಮಸ್ಕಾರ", "హలో", "ਹੈਲੋ", "Bonjour", "Hola",
    "مرحبا", "Ciao", "여보세요", "Привет", "こんにちは", "你好", "Hello"
  ];
  let currentIndex = 0;
  const greetingEl = document.getElementById('greeting-anim');

  // Pre-calculate the longest greeting for min-width
  let maxLen = Math.max(...greetings.map(g => g.length));
 // greetingEl.style.minWidth = (maxLen ) + 'em'; // tweak multiplier as needed for your font

  function showGreeting() {
    greetingEl.style.opacity = 0;
    setTimeout(() => {
      greetingEl.textContent = greetings[currentIndex];
      greetingEl.style.opacity = 1;
      currentIndex = (currentIndex + 1) % greetings.length;
    }, 380); // fade out duration
  }
  //showGreeting();
  //setInterval(showGreeting, 2300);
  // Menu logic, unchanged from your code
  const menuSubmenus = {
    'menu-connect': 'connect-submenu',
    'menu-tools': 'tools-submenu'
  };
  Object.keys(menuSubmenus).forEach(menuId => {
    document.getElementById(menuId).addEventListener('click', function(e) {
      e.stopPropagation();
      // Hide all submenus first
      Object.values(menuSubmenus).forEach(id => {
        document.getElementById(id).classList.remove('show');
      });
      // Toggle this submenu only
    
      const submenu = document.getElementById(menuSubmenus[menuId]);
      submenu.classList.toggle('show');
    });
  });
  document.body.addEventListener('click', function(e){
    if (!e.target.classList.contains('nav-btn')) {
      Object.values(menuSubmenus).forEach(id => {
        document.getElementById(id).classList.remove('show');
      });
    }
  });

  // Dynamic gallery JS, only populates cards:
  fetch('gifs.json')
    .then(response => response.json())
    .then(data => {
      let html = '';
      data.forEach(proj => {
        html += `<div class="work-card"><img src="${proj.img}" alt="${proj.title}"><p class="work-title">${proj.title}</p></div>`;
      });
      document.getElementById('project-gallery').innerHTML = html;
    });
});
