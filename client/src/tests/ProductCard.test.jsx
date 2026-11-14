/* © 2026 Eden Jewelry. All rights reserved. */
// Front-end tests: Vitest + React Testing Library.
import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';

const ring = {
  _id: '64b0000000000000000000a1',
  code: 'R01',
  name: 'Cedar Emerald Solitaire',
  stone: 'emerald',
  color: 'silver',
  price: 95,
  inStock: true,
  images: [],
  videos: [],
};

const renderCard = (product) =>
  render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>
  );

describe('<ProductCard />', () => {
  test('shows the name, stone, price and links to the ring page', () => {
    renderCard(ring);
    expect(screen.getByRole('heading', { name: 'Cedar Emerald Solitaire' })).toBeInTheDocument();
    expect(screen.getByText('Emerald · Silver')).toBeInTheDocument();
    expect(screen.getByText('$95')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/shop/64b0000000000000000000a1');
  });

  test('draws a placeholder ring when there is no photo yet', () => {
    renderCard(ring);
    expect(screen.getByRole('img', { name: 'Cedar Emerald Solitaire' })).toBeInTheDocument();
  });

  test('uses the first photo as the cover and shows a video badge', () => {
    renderCard({ ...ring, images: ['https://example.com/r01.jpg'], videos: ['https://example.com/r01.mp4'] });
    expect(screen.getByRole('img', { name: 'Cedar Emerald Solitaire' })).toHaveAttribute('src', 'https://example.com/r01.jpg');
    expect(screen.getByText('▶ Video')).toBeInTheDocument();
  });

  test('shows "Sold out" for a ring that is not in stock', () => {
    renderCard({ ...ring, inStock: false });
    expect(screen.getByText('Sold out')).toBeInTheDocument();
  });
});
