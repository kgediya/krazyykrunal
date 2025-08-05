document.addEventListener("DOMContentLoaded", function() {
  // Typewriter and Menu code here...
// Typewriter effect
const greetings = [
  "કેમ છો", "कसा काय", "नमस्ते", "வணக்கம்", "നമസ്കാരം", "ನಮಸ್ಕಾರ", "హలో", "ਹੈਲੋ", "Bonjour", "Hola",
  "مرحبا", "Ciao", "여보세요", "Привет", "こんにちは", "你好", "Hello"
];
let currentIndex = 0;
function typeWriter(text, i, interval) {
  if (i < text.length) {
    document.getElementById("typewriter").innerHTML = text.substring(0, i + 1);
    setTimeout(function() {
      typeWriter(text, i + 1, interval);
    }, interval);
  } else {
    setTimeout(changeGreeting, 1400);
  }
}
function changeGreeting() {
  const greeting = greetings[currentIndex];
  currentIndex = (currentIndex + 1) % greetings.length;
  typeWriter(greeting + ", I'm Krazyy Krunal", 0, 90);
}
typeWriter("Hello, I'm Krazyy Krunal", 0, 90);

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
