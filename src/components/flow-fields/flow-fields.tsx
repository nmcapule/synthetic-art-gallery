import { Component, h } from '@stencil/core';

class Vec2 {
  constructor(readonly x: number, readonly y: number) {}
  get length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  normalize() {
    return Vec2.of(this.x / this.length, this.y / this.length);
  }
  multiply(factor: number) {
    return Vec2.of(this.x * factor, this.y * factor);
  }

  static of(x: number, y: number) {
    return new Vec2(x, y);
  }
}

const COLOR_4 = '#4F6F52';
const COLOR_3 = '#739072';
const COLOR_2 = '#86A789';
const COLOR_1 = '#D2E3C8';

@Component({
  tag: 'flow-fields',
  styles: `
  .canvas { width: 100%; height: 100% }
  `,
  shadow: true,
})
export class FlowFields {
  canvas!: HTMLCanvasElement;
  grid: Array<Array<Vec2>>;

  componentDidLoad() {
    // Set internal resolution of canvas to match it's DOM size.
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    const ctx = this.canvas.getContext('2d');

    ctx.fillStyle = COLOR_1;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const cellSize = 8;
    this.grid = [];

    for (let col = 0; col * cellSize < ctx.canvas.width; col++) {
      this.grid.push([]);
      for (let row = 0; row * cellSize < ctx.canvas.height; row++) {
        this.grid[col].push(
          Vec2.of(Math.cos(Math.PI * 2 * (col / ctx.canvas.width)), Math.cos(Math.PI * 3))
            .normalize()
            .multiply(cellSize / 4),
        );

        const x = col * cellSize;
        const y = row * cellSize;
        const midX = x + cellSize / 2;
        const midY = y + cellSize / 2;

        // Draw checkboard.
        if ((col + row) % 2 === 0) {
          ctx.fillStyle = COLOR_2;
          ctx.fillRect(x, y, cellSize, cellSize);
        }

        // Draw vector.
        ctx.strokeStyle = COLOR_4;
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX + this.grid[col][row].x, midY + this.grid[col][row].y);
        ctx.stroke();
      }
    }

    const steps = 50;
    for (let i = 0; i < 500; i++) {
      let curX = Math.random() * this.canvas.width;
      let curY = Math.random() * this.canvas.height;
      ctx.strokeStyle = COLOR_4;
      ctx.moveTo(curX, curY);
      for (let j = 0; j < steps; j++) {
        const cell = this.grid[Math.floor(curX / cellSize)]?.[Math.floor(curY / cellSize)];
        if (!cell) continue;

        const nextX = curX + cell.x;
        const nextY = curY + cell.y;
        ctx.lineTo(nextX, nextY);
        curX = nextX;
        curY = nextY;
      }
      ctx.stroke();
    }
  }

  disconnectedCallback() {}

  render() {
    return <canvas class="canvas" ref={el => (this.canvas = el)} />;
  }
}
