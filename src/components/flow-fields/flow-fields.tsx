import { Component, h } from '@stencil/core';
import * as PIXI from 'pixi.js';

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
  app!: PIXI.Application;
  grid: Array<Array<Vec2>>;

  cellSize = 16;

  componentDidLoad() {
    // Set internal resolution of canvas to match it's DOM size.
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    this.app = new PIXI.Application({
      view: this.canvas,
      resizeTo: this.canvas,
    });

    this.grid = [];

    for (let col = 0; col * this.cellSize < this.canvas.width; col++) {
      this.grid.push([]);
      for (let row = 0; row * this.cellSize < this.canvas.height; row++) {
        const angle = (Math.PI * col * (row * this.cellSize)) / this.canvas.height;
        this.grid[col].push(
          Vec2.of(Math.cos(angle), Math.sin(angle)).normalize().multiply(this.cellSize),
        );
      }
    }

    this.drawFlowFields();
  }

  private drawFlowFields() {
    const colors = [COLOR_4, COLOR_3, COLOR_2, COLOR_1, 'white', 'red', 'blue', 'green'];

    const steps = 5;
    for (let i = 0; i < 3000; i++) {
      const graphics = new PIXI.Graphics();
      let curX = Math.random() * this.canvas.width;
      let curY = Math.random() * this.canvas.height;
      graphics.lineStyle(1, colors[Math.floor(Math.random() * colors.length)], 1);
      graphics.moveTo(curX, curY);
      for (let j = 0; j < steps; j++) {
        const cell =
          this.grid[Math.floor(curX / this.cellSize)]?.[Math.floor(curY / this.cellSize)];
        if (!cell) continue;

        const nextX = curX + cell.x;
        const nextY = curY + cell.y;
        graphics.lineTo(nextX, nextY);
        curX = nextX;
        curY = nextY;
      }
      this.app.stage.addChild(graphics);
    }
  }

  disconnectedCallback() {}

  render() {
    return <canvas class="canvas" ref={el => (this.canvas = el)} />;
  }
}
