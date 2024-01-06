import { Component, h } from '@stencil/core';

@Component({
  tag: 'gallery-item',
  styleUrl: 'gallery-item.css',
  shadow: true,
})
export class GalleryItem {
  render() {
    return (
      <div class="container">
        <slot />
      </div>
    );
  }
}
