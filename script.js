
document.getElementById('year').textContent = new Date().getFullYear();

const menuBtn = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? '' : 'flex';
});

// Lightbox
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImage');
const lbCaption = document.getElementById('lbCaption');
document.addEventListener('click', e=>{
  let a=e.target.closest('.masonry-item');
  if(a){ e.preventDefault(); lbImg.src=a.href; lbCaption.textContent=a.dataset.caption||''; lb.style.display='flex'; }
});
document.getElementById('lbClose').onclick=()=>lb.style.display='none';

// Contact
function handleContact(e){
  e.preventDefault();
  const n=document.getElementById('name').value;
  const em=document.getElementById('email').value;
  const m=document.getElementById('message').value;
  location.href=`mailto:info@shivareva.example?subject=${encodeURIComponent('Enquiry - '+n)}&body=${encodeURIComponent(n+'\n'+em+'\n'+m)}`;
}

// Slideshow simple autoplay
let slides=[], current=0;
const maxSlides=12;
const slideDisplay=document.getElementById('slideDisplay');
function loadSlides(){
  for(let i=1;i<=maxSlides;i++){
    ['jpg','png'].forEach(ext=>{
      let url=`slideshow/slide${i}.`+ext;
      let img=new Image();
      img.onload=()=>{ if(!slides.includes(url)) slides.push(url); };
      img.src=url;
    });
  }
}
loadSlides();

setInterval(()=>{
  if(slides.length==0) return;
  current=(current+1)%slides.length;
  slideDisplay.innerHTML='';
  let img=document.createElement('img');
  img.src=slides[current];
  img.classList.add('show');
  slideDisplay.appendChild(img);
},3500);

// Gallery
const masonry=document.getElementById('masonry');
for(let i=1;i<=24;i++){
  ['jpg','png'].forEach(ext=>{
    let url=`galleryimage/g${i}.`+ext;
    let img=new Image();
    img.onload=()=>{
      const a=document.createElement('a');
      a.href=url; a.className='masonry-item';
      const im=document.createElement('img'); im.src=url;
      a.appendChild(im); masonry.appendChild(a);
    };
    img.src=url;
  });
}
