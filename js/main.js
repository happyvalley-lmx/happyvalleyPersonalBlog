/**
 * some JavaScript code for this blog theme
 */
/* jshint asi:true */

/////////////////////////header////////////////////////////
/**
 * Mobile menu toggle
 */
(function() {
  var menuBtn = document.querySelector('#headerMenu')
  var nav = document.querySelector('#headerNav')
  if (!menuBtn || !nav) return
  menuBtn.onclick = function(e) {
    e.stopPropagation()
    if (menuBtn.classList.contains('active')) {
      menuBtn.classList.remove('active')
      nav.classList.remove('nav-show')
    } else {
      nav.classList.add('nav-show')
      menuBtn.classList.add('active')
    }
  }
  document.querySelector('body').addEventListener('click', function() {
    nav.classList.remove('nav-show')
    menuBtn.classList.remove('active')
  })
}());

/**
 * Theme toggle — flips data-theme on <html> and persists to localStorage.
 * Initial theme is set synchronously by an inline script in _includes/head.html
 * to avoid a light-mode flash.
 */
(function() {
  var btn = document.querySelector('#themeToggle')
  if (!btn) return
  var icon = btn.querySelector('i')

  function syncIcon() {
    var current = document.documentElement.getAttribute('data-theme') || 'light'
    if (!icon) return
    if (current === 'dark') {
      icon.classList.remove('fa-moon-o')
      icon.classList.add('fa-sun-o')
    } else {
      icon.classList.remove('fa-sun-o')
      icon.classList.add('fa-moon-o')
    }
  }

  syncIcon()

  btn.addEventListener('click', function(e) {
    e.stopPropagation()
    var current = document.documentElement.getAttribute('data-theme') || 'light'
    var next = current === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('theme', next) } catch (err) {}
    syncIcon()
  })

  // Follow OS changes when the user has no explicit preference
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)')
    var listener = function(ev) {
      try {
        if (localStorage.getItem('theme')) return
      } catch (err) {}
      document.documentElement.setAttribute('data-theme', ev.matches ? 'dark' : 'light')
      syncIcon()
    }
    if (mq.addEventListener) mq.addEventListener('change', listener)
    else if (mq.addListener) mq.addListener(listener)
  }
}());

//////////////////////////back to top////////////////////////////
(function() {
  var backToTop = document.querySelector('.back-to-top')
  if (!backToTop) return
  window.addEventListener('scroll', function() {
    var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop)
    if (scrollTop > 200) {
      backToTop.classList.add('back-to-top-show')
    } else {
      backToTop.classList.remove('back-to-top-show')
    }
  })
}());

//////////////////////////hover on demo//////////////////////////////
(function() {
  var demoItems = document.querySelectorAll('.grid-item')
}());
