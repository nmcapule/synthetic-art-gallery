export class Vec2 {
  constructor(readonly x: number, readonly y: number) {}
  get length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  add(other: Vec2) {
    return Vec2.of(this.x + other.x, this.y + other.y);
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

type GridGenerator = (col: number, row: number, grid: FlowFieldsGrid) => Vec2;

export class FlowFieldsGrid {
  private cells: Array<Array<Vec2>>;
  constructor(
    readonly rows: number,
    readonly cols: number,
    generator: GridGenerator = () => Vec2.of(0, 0),
  ) {
    this.init(generator);
  }

  private init(generator: GridGenerator) {
    this.cells = [];
    for (let col = 0; col < this.cols; col++) {
      this.cells.push([]);
      for (let row = 0; row < this.rows; row++) {
        this.cells[col].push(generator(col, row, this));
      }
    }
  }

  at(col: number, row: number): Vec2 | undefined {
    return this.cells?.[Math.floor(col)]?.[Math.floor(row)];
  }
}

import * as PIXI from 'pixi.js';

export class Entity {
  colorGenerator?: () => string;

  constructor(public position: Vec2, public velocity: Vec2) {}

  static of(position: Vec2, velocity = Vec2.of(0, 0)) {
    return new Entity(position, velocity);
  }
}

export class FlowFieldsRenderer {
  private app!: PIXI.Application;
  private brush: PIXI.Graphics;
  private texture: PIXI.RenderTexture;
  private entities: Array<Entity> = [];

  constructor(
    readonly canvas: HTMLCanvasElement,
    readonly grid: FlowFieldsGrid,
  ) {
    this.app = new PIXI.Application({
      view: this.canvas,
      resizeTo: this.canvas,
      antialias: true,
    });
    this.brush = new PIXI.Graphics();
    this.app.stage.addChild(this.brush);
    this.texture = PIXI.RenderTexture.create({
      width: this.canvas.width,
      height: this.canvas.height,
    });
    const sprite = new PIXI.Sprite(this.texture);
    this.app.stage.addChild(sprite);
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  get cellSize() {
    return this.canvas.width / this.grid.cols;
  }

  drop(entity: Entity) {
    this.entities.push(entity);
  }

  step(weight = 0.01, maxVelocity = 1) {
    for (const [i, entity] of this.entities.entries()) {
      const cell = this.grid.at(
        entity.position.x / this.cellSize,
        entity.position.y / this.cellSize,
      );
      if (cell) {
        entity.velocity = entity.velocity.add(cell.multiply(weight));
      }
      if (entity.velocity.length > maxVelocity) {
        entity.velocity = entity.velocity.normalize().multiply(maxVelocity);
      }
      this.brush.lineStyle(1, `white`);
      this.brush.moveTo(entity.position.x, entity.position.y);
      entity.position = entity.position.add(entity.velocity);
      this.brush.lineTo(entity.position.x, entity.position.y);
    }
  }

  start(weight = 1, maxVelocity = 5, iterations = 1) {
    for (let i = 0; i < iterations; i++) {
      this.step(weight, maxVelocity);
    }
    this.app.renderer.render(this.brush, {
      renderTexture: this.texture,
      clear: false,
    });
    this.brush.clear();
    window.requestAnimationFrame(this.start.bind(this));
  }
}
