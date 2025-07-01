// Arquivo de animações e efeitos interativos para o tema sci-fi de espaço profundo
// Este script adiciona elementos visuais dinâmicos e interativos ao site UFO Sightings

document.addEventListener('DOMContentLoaded', function() {
    // ===== Efeito de partículas no fundo =====
    createParticleEffect();
    
    // ===== Efeitos de hover aprimorados =====
    enhanceHoverEffects();
    
    // ===== Animações de entrada para elementos =====
    addEntranceAnimations();
    
    // ===== Efeito de distorção para imagens =====
    addImageDistortionEffect();
    
    // ===== Efeito de digitação para títulos =====
    addTypingEffect();
    
    // ===== Efeito de scanner para o mapa =====
    addMapScanEffect();
    
    // ===== Efeito de hologramas 3D =====
    addHologramEffect();
    
    // ===== Efeito de cursor personalizado =====
    addCustomCursor();
});

// Função para criar o efeito de partículas no fundo
function createParticleEffect() {
    // Criar o canvas para as partículas
    const particleCanvas = document.createElement('canvas');
    particleCanvas.id = 'particle-canvas';
    particleCanvas.style.position = 'fixed';
    particleCanvas.style.top = '0';
    particleCanvas.style.left = '0';
    particleCanvas.style.width = '100%';
    particleCanvas.style.height = '100%';
    particleCanvas.style.pointerEvents = 'none';
    particleCanvas.style.zIndex = '-1';
    document.body.appendChild(particleCanvas);
    
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    // Configurar o tamanho do canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Redimensionar o canvas quando a janela for redimensionada
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Configurações das partículas
    const particlesArray = [];
    const numberOfParticles = Math.min(window.innerWidth / 10, 100); // Limitar o número de partículas em dispositivos menores
    
    // Classe para as partículas
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = this.getRandomColor();
        }
        
        getRandomColor() {
            const colors = [
                'rgba(59, 130, 246, 0.7)', // plasma-blue
                'rgba(139, 92, 246, 0.7)',  // warp-purple
                'rgba(0, 246, 255, 0.7)',   // alien-green
                'rgba(226, 232, 240, 0.7)'  // star-white
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Verificar limites
            if (this.x > canvas.width || this.x < 0) {
                this.speedX = -this.speedX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.speedY = -this.speedY;
            }
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Inicializar partículas
    function init() {
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }
    
    // Animar partículas
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
            
            // Conectar partículas próximas
            connectParticles(particlesArray[i], particlesArray);
        }
        
        requestAnimationFrame(animate);
    }
    
    // Conectar partículas próximas com linhas
    function connectParticles(particle, particles) {
        const maxDistance = 100;
        
        for (let i = 0; i < particles.length; i++) {
            const dx = particle.x - particles[i].x;
            const dy = particle.y - particles[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                const opacity = 1 - (distance / maxDistance);
                ctx.strokeStyle = `rgba(0, 246, 255, ${opacity * 0.2})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(particles[i].x, particles[i].y);
                ctx.stroke();
            }
        }
    }
    
    // Iniciar animação
    init();
    animate();
}

// Função para aprimorar efeitos de hover
function enhanceHoverEffects() {
    // Efeito de hover para botões
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 246, 255, 0.4), var(--plasma-blue), var(--warp-purple))`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.background = '';
        });
    });
    
    // Efeito de hover para cards de avistamento
    const cards = document.querySelectorAll('.sighting-card:not(.skeleton)');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calcular a rotação baseada na posição do mouse
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            
            // Adicionar efeito de brilho
            const glowX = (x / rect.width) * 100;
            const glowY = (y / rect.height) * 100;
            this.style.boxShadow = `0 0 20px rgba(0, 246, 255, 0.3), 0 0 30px rgba(0, 246, 255, 0.2)`;
            this.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(26, 43, 69, 0.8), rgba(10, 14, 23, 0.9))`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
            this.style.background = '';
        });
    });
    
    // Efeito de hover para links de navegação
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
        link.addEventListener('mouseover', function() {
            this.style.textShadow = '0 0 10px var(--alien-green), 0 0 20px var(--alien-green)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.textShadow = '';
        });
    });
}

// Função para adicionar animações de entrada
function addEntranceAnimations() {
    // Detectar elementos quando entram na viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Elementos para animar
    const animateElements = document.querySelectorAll('.sighting-card:not(.skeleton), .form-container, .filters, h2, .hero-buttons');
    
    animateElements.forEach(element => {
        // Adicionar classe para estilização
        element.classList.add('animate-element');
        // Observar o elemento
        observer.observe(element);
    });
    
    // Adicionar estilos para animações
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .animate-element {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .animate-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(styleElement);
}

// Função para adicionar efeito de distorção para imagens
function addImageDistortionEffect() {
    // Selecionar todas as imagens em cards e carrossel
    const images = document.querySelectorAll('.sighting-card img, .carousel-slide img');
    
    images.forEach(img => {
        // Criar container para o efeito
        const container = document.createElement('div');
        container.className = 'distortion-container';
        
        // Substituir a imagem pelo container
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
        
        // Adicionar efeito de glitch ao hover
        container.addEventListener('mouseover', function() {
            this.classList.add('distortion-active');
        });
        
        container.addEventListener('mouseleave', function() {
            this.classList.remove('distortion-active');
        });
    });
    
    // Adicionar estilos para o efeito de distorção
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .distortion-container {
            position: relative;
            overflow: hidden;
        }
        
        .distortion-container img {
            transition: filter 0.3s ease;
        }
        
        .distortion-active img {
            filter: contrast(1.2) saturate(1.5) hue-rotate(5deg);
            animation: glitch 0.5s infinite;
        }
        
        @keyframes glitch {
            0% {
                transform: translate(0);
            }
            20% {
                transform: translate(-2px, 2px);
            }
            40% {
                transform: translate(-2px, -2px);
            }
            60% {
                transform: translate(2px, 2px);
            }
            80% {
                transform: translate(2px, -2px);
            }
            100% {
                transform: translate(0);
            }
        }
    `;
    document.head.appendChild(styleElement);
}

// Função para adicionar efeito de digitação para títulos
function addTypingEffect() {
    // Selecionar o título principal da página
    const mainTitle = document.querySelector('.hero h2');
    
    if (mainTitle) {
        const text = mainTitle.textContent;
        mainTitle.textContent = '';
        
        // Adicionar cursor
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.textContent = '|';
        mainTitle.appendChild(cursor);
        
        // Animar digitação
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                const charSpan = document.createElement('span');
                charSpan.textContent = text.charAt(i);
                charSpan.className = 'typed-char';
                mainTitle.insertBefore(charSpan, cursor);
                i++;
            } else {
                clearInterval(typingInterval);
                // Remover classe floating para evitar conflito de animações
                mainTitle.classList.remove('floating');
            }
        }, 100);
        
        // Adicionar estilos para o efeito de digitação
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .typing-cursor {
                color: var(--alien-green);
                animation: blink 1s infinite;
            }
            
            .typed-char {
                display: inline-block;
                animation: pulse-text 0.5s forwards;
            }
            
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
            
            @keyframes pulse-text {
                0% { 
                    opacity: 0; 
                    color: var(--alien-green);
                    text-shadow: 0 0 10px var(--alien-green);
                }
                100% { 
                    opacity: 1; 
                    color: inherit;
                    text-shadow: inherit;
                }
            }
        `;
        document.head.appendChild(styleElement);
    }
}

// Função para adicionar efeito de scanner para o mapa
function addMapScanEffect() {
    // Selecionar o container do mapa
    const mapContainer = document.getElementById('map');
    
    if (mapContainer) {
        // Criar elemento de scanner
        const scanner = document.createElement('div');
        scanner.className = 'map-scanner';
        mapContainer.appendChild(scanner);
        
        // Adicionar estilos para o efeito de scanner
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            #map {
                position: relative;
                overflow: hidden;
            }
            
            .map-scanner {
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 2px;
                background: linear-gradient(to right, transparent, var(--alien-green), transparent);
                box-shadow: 0 0 10px var(--alien-green), 0 0 20px var(--alien-green);
                animation: scan 4s linear infinite;
                z-index: 10;
                pointer-events: none;
            }
            
            @keyframes scan {
                0% {
                    top: 0;
                    left: -100%;
                }
                48% {
                    top: 0;
                    left: 100%;
                }
                50% {
                    top: 0;
                    left: 100%;
                }
                52% {
                    top: 100%;
                    left: 100%;
                }
                100% {
                    top: 100%;
                    left: -100%;
                }
            }
        `;
        document.head.appendChild(styleElement);
    }
}

// Função para adicionar efeito de hologramas 3D
function addHologramEffect() {
    // Selecionar elementos para aplicar o efeito de holograma
    const hologramElements = document.querySelectorAll('.sighting-card h3, .form-container h2, .filters h3');
    
    hologramElements.forEach(element => {
        element.classList.add('hologram-effect');
        
        // Criar camadas para o efeito
        const text = element.textContent;
        element.innerHTML = '';
        
        // Camada base
        const baseLayer = document.createElement('span');
        baseLayer.className = 'hologram-base';
        baseLayer.textContent = text;
        element.appendChild(baseLayer);
        
        // Camada de brilho
        const glowLayer = document.createElement('span');
        glowLayer.className = 'hologram-glow';
        glowLayer.textContent = text;
        element.appendChild(glowLayer);
        
        // Camada de ruído
        const noiseLayer = document.createElement('span');
        noiseLayer.className = 'hologram-noise';
        noiseLayer.textContent = text;
        element.appendChild(noiseLayer);
    });
    
    // Adicionar estilos para o efeito de holograma
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .hologram-effect {
            position: relative;
            display: inline-block;
        }
        
        .hologram-base, .hologram-glow, .hologram-noise {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        
        .hologram-base {
            color: var(--alien-green);
            position: relative;
        }
        
        .hologram-glow {
            color: var(--alien-green);
            filter: blur(4px);
            opacity: 0.7;
            animation: hologram-flicker 4s infinite;
        }
        
        .hologram-noise {
            color: var(--alien-green);
            opacity: 0.1;
            animation: hologram-noise 0.5s steps(2) infinite;
        }
        
        @keyframes hologram-flicker {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 0.3; }
        }
        
        @keyframes hologram-noise {
            0%, 100% { transform: translateX(0); }
            10% { transform: translateX(-1px); }
            20% { transform: translateX(1px); }
            30% { transform: translateX(-2px); }
            40% { transform: translateX(2px); }
            50% { transform: translateX(-1px); }
            60% { transform: translateX(1px); }
            70% { transform: translateX(-2px); }
            80% { transform: translateX(2px); }
            90% { transform: translateX(-1px); }
        }
    `;
    document.head.appendChild(styleElement);
}

// Função para adicionar cursor personalizado
function addCustomCursor() {
    // Criar elementos para o cursor personalizado
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    
    const cursorRing = document.createElement('div');
    cursorRing.className = 'cursor-ring';
    
    cursor.appendChild(cursorDot);
    cursor.appendChild(cursorRing);
    document.body.appendChild(cursor);
    
    // Atualizar posição do cursor
    document.addEventListener('mousemove', function(e) {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
    
    // Adicionar efeito de hover
    document.addEventListener('mouseover', function(e) {
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.classList.contains('btn')) {
            cursor.classList.add('cursor-hover');
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.classList.contains('btn')) {
            cursor.classList.remove('cursor-hover');
        }
    });
    
    // Adicionar efeito de clique
    document.addEventListener('mousedown', function() {
        cursor.classList.add('cursor-click');
    });
    
    document.addEventListener('mouseup', function() {
        cursor.classList.remove('cursor-click');
    });
    
    // Adicionar estilos para o cursor personalizado
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        body {
            cursor: none;
        }
        
        a, button, .btn, input, select, textarea {
            cursor: none;
        }
        
        .custom-cursor {
            position: fixed;
            top: 0;
            left: 0;
            width: 0;
            height: 0;
            pointer-events: none;
            z-index: 9999;
        }
        
        .cursor-dot {
            position: absolute;
            top: -4px;
            left: -4px;
            width: 8px;
            height: 8px;
            background-color: var(--alien-green);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.2s, height 0.2s;
        }
        
        .cursor-ring {
            position: absolute;
            top: -15px;
            left: -15px;
            width: 30px;
            height: 30px;
            border: 2px solid var(--alien-green);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.3s, height 0.3s, border-color 0.3s;
            opacity: 0.5;
        }
        
        .cursor-hover .cursor-dot {
            width: 12px;
            height: 12px;
            background-color: var(--plasma-blue);
        }
        
        .cursor-hover .cursor-ring {
            width: 40px;
            height: 40px;
            border-color: var(--plasma-blue);
            opacity: 0.7;
        }
        
        .cursor-click .cursor-dot {
            transform: translate(-50%, -50%) scale(0.5);
        }
        
        .cursor-click .cursor-ring {
            transform: translate(-50%, -50%) scale(0.8);
        }
        
        @media (max-width: 768px) {
            .custom-cursor {
                display: none;
            }
            
            body, a, button, .btn, input, select, textarea {
                cursor: auto;
            }
        }
    `;
    document.head.appendChild(styleElement);
}
