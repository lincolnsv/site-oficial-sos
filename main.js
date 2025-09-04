let products = [];

// Menu mobile
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('show'));

// Hero slider
const heroSlider = document.getElementById('hero-slider');
let slideIndex = 0;
const totalSlides = heroSlider.children.length;

function updateSlide() {
  heroSlider.style.transform = `translateX(-${slideIndex * 100}%)`;
}

document.getElementById('nextSlide').addEventListener('click', () => {
  slideIndex = (slideIndex + 1) % totalSlides;
  updateSlide();
});
document.getElementById('prevSlide').addEventListener('click', () => {
  slideIndex = (slideIndex - 1 + totalSlides) % totalSlides;
  updateSlide();
});

setInterval(() => {
  slideIndex = (slideIndex + 1) % totalSlides;
  updateSlide();
}, 5000);

// Modal
const modal = document.getElementById('productModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

function openProductModal(product) {
  let selectedVariation = null;
  let currentImageIndex = 0;

  modalContent.innerHTML = `
    <button id="closeModal" class="absolute top-2 right-2 text-gray-600 text-2xl font-bold hover:text-gray-800">&times;</button>
    <h2 class="text-2xl font-bold mb-4">${product.name}</h2>

    <div class="relative mb-4">
      <img id="modalProductImage" src="${product.images[0]}" alt="${product.name}" class="w-full rounded"/>
      ${product.images.length > 1 ? `
        <button id="prevImage" class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 px-2 py-1 rounded hover:bg-white">‹</button>
        <button id="nextImage" class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 px-2 py-1 rounded hover:bg-white">›</button>
      ` : ''}
    </div>

    <p class="mb-2">${product.description}</p>

    <div id="specsContainer" class="mb-2">
      ${product.specs ? `<strong>Especificações:</strong><ul class="list-disc ml-5">${product.specs.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
    </div>

    <p id="variationPrice" class="text-xl font-bold text-blue-600">
      ${typeof product.price === 'object' ? `À vista: ${product.price.avista}${product.price.parcelado ? ` / Parcelado: ${product.price.parcelado}` : ''}` : product.price}
    </p>

    <div class="mb-4">
      <label for="customerName" class="block font-bold mb-1">Seu nome:</label>
      <input type="text" id="customerName" class="w-full border rounded px-3 py-2" placeholder="Digite seu nome">
    </div>

    <button id="whatsappBtn" class="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Comprar via WhatsApp</button>
  `;

  const modalImage = document.getElementById('modalProductImage');

  let imageInterval = setInterval(() => {
    currentImageIndex = (currentImageIndex + 1) % product.images.length;
    modalImage.src = product.images[currentImageIndex];
  }, 3000);

  const prevBtn = document.getElementById('prevImage');
  const nextBtn = document.getElementById('nextImage');

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
      modalImage.src = product.images[currentImageIndex];
    });
    nextBtn.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex + 1) % product.images.length;
      modalImage.src = product.images[currentImageIndex];
    });
  }

  document.getElementById('whatsappBtn').addEventListener('click', () => {
    const nameInput = document.getElementById('customerName').value.trim();
    const name = nameInput ? nameInput : "Cliente";
    const p = selectedVariation || product;
    const priceText = typeof p.price === 'object' ? `${p.price.avista}${p.price.parcelado ? ` / Parcelado: ${p.price.parcelado}` : ''}` : p.price;

    const msg = encodeURIComponent(
      `Olá, meu nome é ${name}.\nEstou entrando em contato pelo site da S.O.S Celulares.\nTenho interesse no seguinte produto:\n📱 Produto: ${p.name}\n${p.color ? `🎨 Cor: ${p.color}\n` : ''}${p.condition ? `🛠️ Estado: ${p.condition}\n` : ''}💰 Preço: ${priceText}\nGostaria de receber mais informações e verificar disponibilidade.`
    );
    window.open(`https://wa.me/5564999518536?text=${msg}`, '_blank');
  });

  document.getElementById('closeModal').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modalOverlay.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.classList.add('active');
}

function preloadImages(urls) {
  return Promise.all(urls.map(src => new Promise(resolve => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = resolve;
  })));
}

async function loadProducts() {
  try {
    const response = await fetch('produtos.json');
    const data = await response.json();
    products = data.map(p => {
      if (!p.category) p.category = 'Acessório';
      if (!p.images || p.images.length === 0) p.images = ['imagens/default.png'];
      return p;
    });
    const allImages = products.flatMap(p => p.images);
    await preloadImages(allImages);
    renderProducts(products);
  } catch (err) {
    console.error('Erro ao carregar produtos.json', err);
  }
}

function renderProducts(products) {
  const newC = document.getElementById('new-phones-container');
  const usedC = document.getElementById('used-phones-container');
  const accC = document.getElementById('accessories-container');
  newC.innerHTML = usedC.innerHTML = accC.innerHTML = '';

  const categories = { "Novo": newC, "Seminovo": usedC, "Acessório": accC };

  Object.keys(categories).forEach(cat => {
    const container = categories[cat];
    const produtosCat = products.filter(p => p.category === cat);

    produtosCat.forEach((p, index) => {
      const card = document.createElement('div');
      card.className = 'group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer card-hover card-animate';
      if (index >= 3) card.style.display = 'none';

      card.innerHTML = `
        <div class="relative h-48 bg-gray-100 flex items-center justify-center p-4 overflow-hidden">
          <img src="${p.images[0]}" alt="${p.name}" class="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy">
          <button class="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition">Ver Produto</button>
        </div>
        <div class="p-4">
          <h3 class="text-lg font-bold text-gray-800 mb-1">${p.name}</h3>
          <p class="text-gray-600 text-sm mb-2">${p.description}</p>
          ${p.color ? `<p class="text-gray-600 text-sm mb-2"><strong>Cor:</strong> ${p.color}</p>` : ''}
          ${p.condition ? `<p class="text-gray-600 text-sm mb-2"><strong>Estado:</strong> ${p.condition}</p>` : ''}
          ${typeof p.price === 'object' 
            ? `<p class="text-xl font-bold text-blue-600 mb-1">À vista: ${p.price.avista || ''}</p>
               ${p.price.parcelado ? `<p class="text-xl font-bold text-blue-600">Parcelado: ${p.price.parcelado}</p>` : ''}`
            : `<p class="text-xl font-bold text-blue-600">${p.price}</p>`}
        </div>
      `;

      card.querySelector('button').addEventListener('click', () => openProductModal(p));
      container.appendChild(card);
    });

    if (produtosCat.length > 3) {
      const verMaisCard = document.createElement('div');
      verMaisCard.className = 'col-span-full flex justify-center mt-4';
      const verMaisBtn = document.createElement('button');
      verMaisBtn.className = 'bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition';
      verMaisBtn.textContent = 'Ver Mais';
      verMaisCard.appendChild(verMaisBtn);
      container.appendChild(verMaisCard);

      verMaisBtn.addEventListener('click', () => {
        const hiddenCards = Array.from(container.children).filter(c => c !== verMaisCard && c.style.display === 'none');
        if (hiddenCards.length > 0) { hiddenCards.forEach(c => c.style.display = 'block'); verMaisBtn.textContent = 'Ver Menos'; }
        else { Array.from(container.children).forEach((c, i) => { if (c !== verMaisCard) c.style.display = i < 3 ? 'block' : 'none'; }); verMaisBtn.textContent = 'Ver Mais'; }
      });
    }
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.card-animate').forEach(card => observer.observe(card));
}

// Scroll to top
const scrollBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => { scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none'; });
scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Carregar produtos
document.addEventListener('DOMContentLoaded', loadProducts);
