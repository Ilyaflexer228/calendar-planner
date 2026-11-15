/**
 * Праздничные ненавязчивые снежинки для создания новогодней атмосферы
 * Бережно расходуют батарею и отключаются при prefers-reduced-motion
 */

export class SnowfallEffect {
  constructor(canvasId = 'snowCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.flakes = [];
    this.maxFlakes = 45; // Малое количество для высокой производительности
    this.isRunning = false;

    // Проверяем prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    this.initFlakes();
    this.start();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initFlakes() {
    this.flakes = [];
    for (let i = 0; i < this.maxFlakes; i++) {
      this.flakes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: Math.random() * 2.2 + 0.8,
        d: Math.random() * this.maxFlakes,
        speed: Math.random() * 0.7 + 0.3,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  stop() {
    this.isRunning = false;
  }

  loop() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

    for (let i = 0; i < this.maxFlakes; i++) {
      const f = this.flakes[i];
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(224, 231, 255, ${f.opacity})`;
      this.ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
      this.ctx.fill();

      // Движение
      f.y += f.speed;
      f.x += Math.sin(f.d) * 0.4;
      f.d += 0.01;

      // Возврат наверх при падении
      if (f.y > this.height) {
        f.y = -5;
        f.x = Math.random() * this.width;
      }
    }

    requestAnimationFrame(() => this.loop());
  }
}
