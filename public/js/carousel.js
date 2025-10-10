class Carousel {
    constructor() {
        this.slides = [
            { image: './img/bg-img/3.jpg' },
            { image: './img/bg-img/4.jpg' },
            { image: './img/bg-img/5.jpg' }
        ];
        this.currentSlide = 0;
        this.interval = null;
        this.renderSlides();
        this.startAutoSlide();
        console.log('test1');
    }

    renderSlides() {
        const carouselSlides = document.getElementById("carousel-slides");
        carouselSlides.innerHTML = this.slides.map((slide, index) =>
            `<img src="${slide.image}" class="carousel-image" style="opacity: ${index === this.currentSlide ? 1 : 0};">`
        ).join("");
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide === 0) ? this.slides.length - 1 : this.currentSlide - 1;
        this.renderSlides();
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.renderSlides();
    }

    startAutoSlide() {
        this.interval = setInterval(() => {
            this.nextSlide();
        }, 3000); // Change slide every 3 seconds
    }

    stopAutoSlide() {
        clearInterval(this.interval);
    }
}

const carousel = new Carousel();
