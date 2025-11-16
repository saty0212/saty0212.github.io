/* script.js - robust loader for slideshow + gallery with diagnostics */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- NAV / LIGHTBOX / CONTACT (unchanged) ---------- */
const menuBtn = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if(menuBtn) menuBtn.addEventListener('click', () => { navLinks.style.display = navLinks.style.display === 'flex' ? '' : 'flex'; });

// Lightbox
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImage');
const lbCaption = document.getElementById('lbCaption');
if (document) {
  document.addEventListener('click', e=>{
    let a = e.target.closest && e.target.closest('.masonry-item');
    if(a){
      e.preventDefault();
      lbImg.src = a.href;
      lbCaption.textContent = a.dataset.caption || '';
      lb.style.display = 'flex';
      lb.setAttribute('aria-hidden','false');
    }
  });
}
const lbClose = document.getElementById('lbClose');
if(lbClose) lbClose.onclick = ()=> { lb.style.display = 'none'; lb.setAttribute('aria-hidden','true'); };

// Contact handler
window.handleContact = function(e){
  e.preventDefault();
  const n=document.getElementById('name').value || '';
  const em=document.getElementById('email').value || '';
  const m=document.getElementById('message').value || '';
  location.href = `mailto:info@shivareva.example?subject=${encodeURIComponent('Enquiry - '+n)}&body=${encodeURIComponent(n+'\\n'+em+'\\n'+m)}`;
};

/* ---------- SLIDESHOW (preloader + autoplay) ---------- */
const slideDisplay = document.getElementById('slideDisplay');
const maxSlides = 12;
const acceptedExt = ['jpg','png'];
const slideBase = 'slideshow/slide';
const slideIntervalMs = 3500;

let slides = [];
let current = -1;
let autoplayTimer = null;
let firstImageShown = false;

function loadImage(url){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(url);
    img.src = url;
  });
}

async function discoverAndPreloadSlides(){
  const attempts = [];
  for(let i=1;i<=maxSlides;i++){
    for(const ext of acceptedExt){
      const url = `${slideBase}${i}.${ext}`;
      // start loading but don't await each one sequentially
      const p = loadImage(url)
        .then(u => {
          if(!slides.includes(u)) slides.push(u);
          // show the very first loaded image immediately
          if(!firstImageShown){
            showSlideByUrl(u);
            firstImageShown = true;
          }
          console.debug('Slide found:', u);
          return u;
        })
        .catch(u => {
          // console.debug('Slide not found:', u);
          return null;
        });
      attempts.push(p);
    }
  }

  // After all attempts finish, ensure unique order and start autoplay if we have slides
  Promise.all(attempts).then(() => {
    slides = Array.from(new Set(slides));
    console.info('Slide discovery complete. total slides:', slides.length);
    if(slides.length > 0 && !autoplayTimer){
      // if current index not set align it
      if(current < 0) current = 0;
      startAutoplay();
    } else if(slides.length === 0){
      // no slides found - remove loader
      hideLoader();
      console.warn('No slideshow images found in /slideshow/ (checked slide1..slide' + maxSlides + ')');
    }
  });

  // fallback: if first image not shown after short timeout, hide loader and wait for images
  setTimeout(() => {
    if(!firstImageShown){
      if(slides.length > 0){
        showSlideByUrl(slides[0]);
        firstImageShown = true;
        startAutoplay();
      } else {
        hideLoader();
      }
    }
  }, 900);
}

function showSlideByUrl(url){
  if(!slideDisplay) return;
  if(!url) return;
  hideLoader();
  slideDisplay.innerHTML = '';
  const img = document.createElement('img');
  img.src = url;
  img.alt = 'Slide';
  img.classList.add('show');
  slideDisplay.appendChild(img);
  const idx = slides.indexOf(url);
  current = (idx >= 0) ? idx : 0;
}

function nextSlide(){
  if(!slides.length) return;
  current = (current + 1) % slides.length;
  showSlideByUrl(slides[current]);
}
function startAutoplay(){
  stopAutoplay();
  autoplayTimer = setInterval(nextSlide, slideIntervalMs);
}
function stopAutoplay(){
  if(autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
}

function showLoader(){
  if(!slideDisplay) return;
  if(slideDisplay.querySelector('.loader')) return;
  const d = document.createElement('div');
  d.className = 'loader';
  slideDisplay.appendChild(d);
}
function hideLoader(){
  if(!slideDisplay) return;
  const l = slideDisplay.querySelector('.loader');
  if(l) l.remove();
}

/* kick off slideshow discovery */
showLoader();
discoverAndPreloadSlides();

/* keyboard navigation */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowLeft'){ stopAutoplay(); if(slides.length){ current = (current-1+slides.length)%slides.length; showSlideByUrl(slides[current]); } }
  if(e.key === 'ArrowRight'){ stopAutoplay(); if(slides.length){ nextSlide(); } }
});

/* ---------- GALLERY LOADER (robust) ---------- */
const masonry = document.getElementById('masonry');
const maxGallery = 24;
let galleryFound = 0;

// small helper to try a URL and append only on successful load
function tryAppendGalleryImage(url){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // build anchor + image element
      const a = document.createElement('a');
      a.href = url;
      a.className = 'masonry-item';
      a.dataset.caption = '';
      const im = document.createElement('img');
      im.src = url;
      im.alt = 'Gallery image';
      a.appendChild(im);
      if(masonry) masonry.appendChild(a);
      galleryFound++;
      resolve(url);
    };
    img.onerror = () => reject(url);
    img.src = url;
  });
}

async function discoverGallery(){
  if(!masonry){
    console.warn('Gallery container (#masonry) not found in DOM.');
    return;
  }
  // clear any previous children (safety)
  masonry.innerHTML = '';

  const attempts = [];
  for(let i=1;i<=maxGallery;i++){
    for(const ext of ['jpg','png']){
      const url = `galleryimage/g${i}.${ext}`;
      // start check
      const p = tryAppendGalleryImage(url)
        .then(u => { console.debug('Gallery image added:', u); return u; })
        .catch(u => { /* not found */ return null; });
      attempts.push(p);
    }
  }

  // after a short delay, if no images were found, show a friendly message
  setTimeout(()=>{
    if(galleryFound === 0){
      const note = document.createElement('div');
      note.className = 'gallery-empty';
      note.textContent = 'No gallery images found. Place your images in /galleryimage/ named g1.jpg, g2.jpg ...';
      note.style.padding = '1rem 0';
      note.style.color = '#64748b';
      if(masonry) masonry.appendChild(note);
      console.warn('No images found in galleryimage/ (checked g1..g' + maxGallery + ')');
    } else {
      console.info('Gallery discovery complete. images added:', galleryFound);
    }
  }, 800);

  // Allow all attempts to complete in background (not strictly necessary to await)
  await Promise.allSettled(attempts);
}

/* start gallery discovery */
discoverGallery();