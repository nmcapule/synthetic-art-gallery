import { Component, h } from '@stencil/core';
import * as PIXI from 'pixi.js';

import { Entity, FlowFieldsGrid, FlowFieldsRenderer, Vec2 } from './renderer';

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
  flowFieldsRenderer: FlowFieldsRenderer;

  componentDidLoad() {
    const cellSize = 8;

    // Set internal resolution of canvas to match it's DOM size.
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    this.flowFieldsRenderer = new FlowFieldsRenderer(
      this.canvas,
      new FlowFieldsGrid(
        this.canvas.width / cellSize,
        this.canvas.height / cellSize,
        (col, row, _grid) => {
          const angle = (Math.PI * (row * cellSize)) / this.canvas.height;
          return Vec2.of(Math.cos(angle), Math.sin(angle)).normalize();
        },
      ),
    );

    for (let i = 0; i < this.flowFieldsRenderer.grid.cols; i++) {
      for (let j = 0; j < this.flowFieldsRenderer.grid.rows; j++) {
        this.flowFieldsRenderer.drop(
          Entity.of(
            Vec2.of(
              //
              i * cellSize + cellSize / 2,
              //
              j * cellSize + cellSize / 2,
            ),
          ),
        );
      }
    }

    this.flowFieldsRenderer.start();
  }

  disconnectedCallback() {}

  render() {
    return <canvas class="canvas" ref={el => (this.canvas = el)} />;
  }
}
